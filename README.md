# hn-recommendation-api

This project provides a recommendation engine for Hacker News posts based on their content. It utilizes the concept of embeddings to compute the similarity between posts. Specifically, the text of each post is extracted using the Diffbot API, and embeddings are computed using the OpenAI API with the "text-embedding-ada-002" model. An HNSW index is built using Faiss to quickly find the nearest items.

## Components

The project consists of three parts:

-   `root`: The API using Python and FastAPI.
-   `next`: The website using Next.JS and Typescript.
-   `createIndex.piynb`: The Jupyter notebook to convert the dataset to a Faiss HNSW index.

## Dataset

The dataset used to train the embeddings is available on Kaggle: https://www.kaggle.com/datasets/julien040/hacker-news-openai-embeddings

## Blog Post

A blog post about extracting the embeddings of Hacker News posts to get a recommendation engine is available at https://julienc.me/articles/Extract_embeddings_Hacker_News_article

## Contact

For any questions or API access requests, please contact me at contact[at]julienc.me.

## Disclaimer

This project is not affiliated with Y Combinator or Hacker News.

## License

This project is licensed under the MIT License.