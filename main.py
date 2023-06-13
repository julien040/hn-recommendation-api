from fastapi import FastAPI, Query, HTTPException
from embeddings import compute_embeddings
from faiss_index import get_similar_posts
from urllib.parse import urlparse
from database import get_posts_from_database
from time import time

from typing import Annotated

app = FastAPI()


@app.get("/")
async def read_root(url: Annotated[str, Query(min_length=5)]):
    """
    Get the similar posts for a given URL.
    """

    # Check if the URL is valid.
    try:
        parsed_url = urlparse(url)
        if parsed_url.scheme not in ["http", "https"]:
            raise HTTPException(status_code=400, detail="Invalid URL")
    except:
        raise HTTPException(status_code=400, detail="Invalid URL")
    start = time()

    # We compute the embeddings using Diffbot and OpenAI.
    embed = await compute_embeddings(url)
    embeddingTime = time() - start

    # We get the similar posts using faiss.
    ids, distance = get_similar_posts(embed)
    searchTime = time() - start - embeddingTime

    # We get the posts from the database.
    data = await get_posts_from_database(ids)
    databaseTime = time() - start - embeddingTime - searchTime

    # We add the distance to the posts.
    for i in range(len(data)):
        data[i].distance = distance[i]

    return {
        "url": url,
        "number_of_posts": len(data),
        "data": data,
        "time": {
            "embedding": round(embeddingTime * 1000, 4),
            "search": round(searchTime * 1000, 4),
            "database": round(databaseTime * 1000, 4),
        }

    }
