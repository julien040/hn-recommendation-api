from faiss import read_index
import numpy as np


index = read_index("data/index.faiss")


def get_similar_posts(embeddings: list[float]) -> tuple[list[str], list[float]]:
    # We convert the embeddings to a numpy array.
    toSearch = np.array([embeddings]).astype("float32")
    # We reshape the array to the correct shape needed by faiss.
    toSearch.reshape(1, len(embeddings))

    # Due to a strange bug, we need to convert the k to an int.
    k = 50
    k = int(k)

    # D is
    D, I = index.search(toSearch, k)

    return [str(id) for id in I[0]], D[0].tolist()
