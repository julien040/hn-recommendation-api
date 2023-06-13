
from tiktoken import get_encoding
from os import getenv
from fastapi import HTTPException
from async_lru import alru_cache
from asyncio import sleep
from random import random
import openai
import aiohttp

# Set to a global variable to avoid calling the function every time.
enc = get_encoding("cl100k_base")

# We define OpenAI's API key and endpoint.
openai.api_key = getenv("AZURE_AI_API_KEY")
openai.api_base = getenv("AZURE_AI_ENDPOINT")
openai.api_type = "azure"
openai.api_version = getenv("AZURE_AI_VERSION")


# Constants
# The maximum number of tokens we will use to compute embeddings.
MAX_TOKENS = 512
DIMENSIONS = 1536  # The number of dimensions of the embeddings.
MODEL_ID = "text-embedding-ada-002"  # The ID of the model to use.

# Define session to avoid creating a new session every time.
session = aiohttp.ClientSession()


@alru_cache(maxsize=2048)
async def compute_embeddings(url: str) -> list[float]:
    """
    Compute the embeddings of a URL from the text of the article.
    First, we get the text of the article.
    Then, we shrink the text to MAX_TOKENS tokens.
    Finally, we compute the embeddings of the text.

    The dimension for text-embedding-ada-002 is 1536.

    Args:
        url (str): The URL of the article.

    Returns:
        list[float]: The embeddings of the article.
    """
    text = await get_text(url)
    text = get_text_truncated_tokenized(text, MAX_TOKENS)

    if (len(text) == 0):
        raise HTTPException(
            status_code=502, detail="The text extracted with Diffbot is empty.")

    # We compute the embeddings.
    response = (await openai.Embedding.acreate(input=text, model=MODEL_ID, deployment_id=getenv("AZURE_DEPLOYMENT_ID")))
    return response[  # type: ignore
        'data'][0]['embedding']


async def get_text(url: str) -> str:
    """
    Fetch the text of an article using Diffbot's Article API.

    Args:
        url (str): The URL of the article.

    Returns:
        str: The text of the article.
    """

    params = {
        "url": url,
        "token": getenv("DIFFBOT_API_KEY"),
    }

    headers = {
        "Accept": "application/json",
    }

    """ response = requests.get(
        "https://api.diffbot.com/v3/article", params=params, headers=headers) """

    response = await session.get("https://api.diffbot.com/v3/article", params=params, headers=headers)

    if (response.status == 429):
        # Wait for a random amount of time between 1 and 5 seconds.
        await sleep(1 + random() * 4)
        return await get_text(url)

    # We check if the request was successful.
    if (response.status != 200):
        raise HTTPException(
            status_code=502, detail="Error while fetching the text of the article with: {}".format(response.text))

    json = await response.json()

    if "error" in json:
        raise HTTPException(
            status_code=502, detail="Error while fetching the text of the article with: {}".format(response.json()["error"]))  # type: ignore

    data = json["objects"][0]

    # We check if the text is returned by the API.
    if ("text" not in data):
        raise HTTPException(
            status_code=502, detail="The text was not returned by the API.")

    return data["text"]


def get_text_truncated_tokenized(text: str, max_tokens: int) -> str:
    """
    Truncate a text to the desired number of tokens.
    It's to avoid excessive costs when computing embeddings.

    Args:
        text (str): The text to truncate.
        max_tokens (int): The maximum number of tokens in cl100k_base

    """
    # We tokenize the text.
    tokens = enc.encode(text)

    # We truncate the tokens.
    tokens = tokens[:max_tokens]

    # We decode the tokens.
    text = enc.decode(tokens)

    # As stated here: https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#embeddings
    # It's best to replace newlines with spaces.
    text = text.replace("\n", " ")

    return text
