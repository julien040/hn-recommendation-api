import redis.asyncio as Redis
from os import getenv
from typing import Union
from pydantic import BaseModel

# Define Redis connection.
con = Redis.from_url(str(getenv("REDIS_URL_POST")))

# Define the prefix for the keys.
prefix = "hn:"

# Define the model for the post.


class Post(BaseModel):
    id: str
    title: str
    url: str
    score: int
    time: int
    comments: int
    author: str
    distance: Union[float, None] = None


test = Post(id="1", title="test", url="https://example.com",
            score=1, time=1, comments=1, author="test")


async def get_posts_from_database(ids: list[str]) -> list[Post]:
    """
    Fetch the posts from the database using a Redis pipeline.

    Args:
        ids (list[str]): A list of IDs of the posts to fetch.

    Returns:
        list[Post]: The list of posts.
    """

    # We create a pipeline.
    pipeline = con.pipeline()
    for id in ids:
        pipeline.hmget(prefix + id, "title", "url",
                       "score", "time", "comments", "by")

    # We execute the pipeline.
    results = await pipeline.execute()

    # We create a list of posts.
    posts = []
    for i in range(len(results)):
        try:
            post = Post(id=ids[i], title=results[i][0].decode("utf-8"), url=results[i][1].decode("utf-8"),
                        score=int(results[i][2]), time=int(results[i][3]), comments=int(results[i][4]), author=results[i][5].decode("utf-8"))
            posts.append(post)
        except:
            print("Error while parsing the post with ID: {}".format(ids[i]))
            print("The post is: {}".format(results[i]))
            continue

    return posts
