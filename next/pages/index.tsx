import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Skeleton from "../components/skeleton";
import PostComponent from "../components/posts";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { url } from "inspector";

async function getDataFromAPI(text: string): Promise<Post[]> {
  let isURL = false;
  try {
    new URL(text);
    isURL = true;
  } catch (error) {
    isURL = false;
  }

  let urlAPI = "";

  if (isURL) {
    urlAPI =
      process.env.VECTOR_SEARCH_API_URL + "?url=" + encodeURIComponent(text);
  } else {
    urlAPI =
      process.env.VECTOR_SEARCH_API_URL +
      "/text?text=" +
      encodeURIComponent(text);
  }

  const response = await fetch(urlAPI);

  if (!response.ok) {
    try {
      const data = await response.json();
      if (data["detail"] === undefined) {
        throw new Error("Something went wrong");
      }

      throw new Error(data["detail"]);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Something went wrong");
    }
  } else {
    const data = await response.json();

    return data["data"];
  }
}

export const getServerSideProps: GetServerSideProps<{
  posts: Post[];
  query: string;
  error?: string;
}> = async ({ req, res, query }) => {
  res.setHeader("Cache-Control", "s-maxage=3600");

  let textURLParams = query?.q;

  if (!textURLParams || Array.isArray(textURLParams)) {
    return {
      props: {
        posts: [],
        query: "",
      },
    };
  }

  try {
    const posts = await getDataFromAPI(textURLParams);
    return {
      props: {
        posts,
        query: textURLParams,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        props: {
          posts: [],
          query: textURLParams,
          error: error.message,
        },
      };
    }
  }
  return {
    props: {
      posts: [],
      query: textURLParams,
      error: "Something went wrong",
    },
  };
};

export type Post = {
  id: number;
  title: string;
  url: string;
  score: number;
  comments: number;
  time: number;
  author: string;
  distance: number;
};

export default function Home({
  posts,
  query,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const path = router.asPath;
  const [InputText, setInputText] = useState<string>(query);
  const [Submitted, setSubmitted] = useState<boolean>(false);
  const [ErrorText, setErrorText] = useState(!error ? "" : error);
  const [SortingType, setSortingType] = useState("relevance");

  // Reset state when the URL changes
  useEffect(() => {
    setInputText(query);
    setSubmitted(false);
    setErrorText("");
  }, [path, query]);

  function pushExample(text: string) {
    setInputText(text);
    setSubmitted(true);
    error = undefined;
    posts.length = 0;
    router.push("/?q=" + encodeURIComponent(text));
  }

  function isAGoodInput(text: string) {
    if (text.length === 0) {
      return true;
    }
    if (text.split(" ").length > 1) {
      return true;
    }
    if (text.startsWith("https://") || text.startsWith("http://")) {
      return true;
    }
    return false;
  }

  // Called when the user clicks the submit button
  function buttonClick() {
    // Check if the input is empty
    if (InputText.length === 0) {
      setErrorText("Please enter a query");
      setTimeout(() => {
        setErrorText("");
      }, 3000);
      return;
    }

    if (Submitted) {
      return;
    }

    if (InputText === query) {
      setErrorText("Please enter a different text");
      setTimeout(() => {
        setErrorText("");
      }, 3000);
      return;
    }
    setSubmitted(true);
    error = undefined;
    posts.length = 0;
    router.push("/?q=" + encodeURIComponent(InputText));
  }

  function sortArray(type: string, a: Post, b: Post) {
    if (type === "relevance") {
      return b.distance - a.distance;
    } else if (type === "newest") {
      return b.time - a.time;
    } else if (type === "oldest") {
      return a.time - b.time;
    } else if (type === "comments") {
      return b.comments - a.comments;
    } else if (type === "score") {
      return b.score - a.score;
    }
    return 0;
  }

  return (
    <main className="min-h-[inherit]">
      <Head>
        <title>{"HN - Recommendation"}</title>
        <meta
          name="description"
          content="Get popular Hacker News posts related to a URL or text thanks to machine learning. It's open source and free to use."
        />
        <meta property="og:title" content={"HN - Recommendation"} />
        <meta
          property="og:description"
          content="HN recommandation gives you the most popular Hacker News posts related to a URL or text. It uses a machine learning model to find the most similar posts. It's open source and free to use."
        />

        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="HN - Recommendation" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Link href="/">
        <h1 className="text-2xl md:text-4xl font-bold leading-1">
          HN recommendation
        </h1>
      </Link>
      <p className="text-slate-600">
        Get popular Hacker News posts related to a URL or text
      </p>
      {/* <p className=" bg-white/20 p-4 rounded-xl mt-2 text-sm">
        ⚠️ To get better search results, input a sentence, a paragraph or an url
        instead of a single word
      </p> */}
      <div className="flex gap-2 mt-2 mb-2  ">
        <input
          placeholder="https://samwho.dev/memory-allocation/"
          value={InputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full px-4 py-4 h-full transition-all duration-200 bg-white/40 rounded-xl text-sm focus:bg-white/80  focus:outline-none disabled:cursor-not-allowed"
          disabled={Submitted}
        />
        <button
          className="px-4 py-1 rounded-xl bg-white/40 hover:bg-white/80 transition-all duration-200 font-medium text-sm disabled:opacity-60 disabled:hover:bg-white/40 disabled:cursor-not-allowed"
          disabled={Submitted}
          onClick={buttonClick}
        >
          Submit
        </button>
      </div>
      {ErrorText.length > 0 ? (
        <p className="text-red-500 text-sm ">{ErrorText}</p>
      ) : null}
      {isAGoodInput(InputText) ? null : (
        <div className="bg-white/50 p-4 rounded-xl mt-2 text-sm mb-4">
          ⚠️ Because of the way the model works, it&apos;s better to input a
          sentence, a paragraph or an url instead of a single word
        </div>
      )}

      {InputText.length === 0 && posts.length === 0 ? (
        <div className="py-4">
          <p className="text-slate-600 text-sm mb-4">Try an example:</p>
          <div className="flex gap-2 mt-2">
            <div
              className="text-center w-full cursor-pointer flex flex-col items-center"
              onClick={() =>
                pushExample("Resources to learn about distributed systems")
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24}>
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M2 7c0-1.886 0-2.828.586-3.414C3.172 3 4.114 3 6 3h12c1.886 0 2.828 0 3.414.586C22 4.172 22 5.114 22 7c0 1.886 0 2.828-.586 3.414C20.828 11 19.886 11 18 11H6c-1.886 0-2.828 0-3.414-.586C2 9.828 2 8.886 2 7Zm4-.75a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5H6Zm4.25.75a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75ZM2 17c0-1.886 0-2.828.586-3.414C3.172 13 4.114 13 6 13h12c1.886 0 2.828 0 3.414.586C22 14.172 22 15.114 22 17c0 1.886 0 2.828-.586 3.414C20.828 21 19.886 21 18 21H6c-1.886 0-2.828 0-3.414-.586C2 19.828 2 18.886 2 17Zm4-.75a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5H6Zm4.25.75a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm mt-2">
                Resource about distributed systems
              </p>
              <p className="text-xs text-slate-600">(Text Query) </p>
            </div>
            <div
              className="text-center w-full cursor-pointer flex flex-col items-center"
              onClick={() =>
                pushExample("What programming books should I read?")
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24}>
                <path fill="none" d="M0 0h24v24H0z" />
                <g fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M6.271 2.112c-.81.106-1.238.301-1.544.6-.305.3-.504.72-.613 1.513C4.002 5.042 4 6.124 4 7.675v8.57a4.172 4.172 0 0 1 1.299-.593c.528-.139 1.144-.139 2.047-.138H20V7.676c0-1.552-.002-2.634-.114-3.451-.109-.793-.308-1.213-.613-1.513-.306-.299-.734-.494-1.544-.6-.834-.11-1.938-.112-3.522-.112H9.793c-1.584 0-2.688.002-3.522.112Zm.488 4.483c0-.448.37-.811.827-.811h8.828a.82.82 0 0 1 .827.81.82.82 0 0 1-.827.811H7.586a.82.82 0 0 1-.827-.81Zm.827 2.973a.82.82 0 0 0-.827.81c0 .448.37.811.827.811h5.517a.82.82 0 0 0 .828-.81.82.82 0 0 0-.828-.811H7.586Z"
                    clipRule="evenodd"
                  />
                  <path d="M7.473 17.135H20c-.003 1.13-.021 1.974-.113 2.64-.109.793-.308 1.213-.613 1.513-.306.299-.734.494-1.544.6-.834.11-1.938.112-3.522.112H9.793c-1.584 0-2.688-.002-3.522-.111-.81-.107-1.238-.302-1.544-.601-.305-.3-.504-.72-.613-1.513-.041-.3-.068-.637-.084-1.02a2.464 2.464 0 0 1 1.697-1.537c.29-.076.667-.083 1.746-.083Z" />
                </g>
              </svg>
              <p className="text-sm mt-2">
                What programming books should I read?
              </p>
              <p className="text-xs text-slate-600">(Question Query)</p>
            </div>
            <div
              className="text-center w-full cursor-pointer flex flex-col items-center"
              onClick={() =>
                pushExample("https://samwho.dev/memory-allocation/")
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24}>
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  fill="currentColor"
                  d="M9 15V9h6v6H9Zm0 6v-2H7q-.825 0-1.413-.588T5 17v-2H3v-2h2v-2H3V9h2V7q0-.825.588-1.413T7 5h2V3h2v2h2V3h2v2h2q.825 0 1.413.588T19 7v2h2v2h-2v2h2v2h-2v2q0 .825-.588 1.413T17 19h-2v2h-2v-2h-2v2H9Zm8-4V7H7v10h10Z"
                />
              </svg>
              <p className="text-sm mt-2">Memory allocation</p>
              <p className="text-xs text-slate-600">
                from Samwho.dev
                <br />
                (Article query)
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div
        id="posts"
        className="w-full flex flex-col min-h-[inherit] h-full gap-2"
      >
        {posts.length > 0 ? (
          <div>
            <select
              onChange={(e) => setSortingType(e.target.value)}
              value={SortingType}
            >
              <option value="relevance">Relevance</option>
              <option value="oldest">Oldest</option>
              <option value="newest">Newest</option>
              <option value="score">Score</option>
              <option value="comments">Comments</option>
            </select>
          </div>
        ) : null}
        {posts.length > 0
          ? posts
              .sort((a, b) => sortArray(SortingType, a, b))
              .slice(0, 20)
              .map((post) => <PostComponent key={post.id} post={post} />)
          : null}
        {error != undefined && posts.length === 0 && !Submitted ? (
          <p className=" tracking-tight font-medium text-base my-auto text-center ">
            {error} <br />
            Retry with another URL.
          </p>
        ) : null}
        {
          // Show a loading indicator if the user has submitted a URL
          Submitted ? <Skeleton /> : null
        }
      </div>
    </main>
  );
}
