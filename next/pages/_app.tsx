import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Link from "next/link";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
        #__next {
          min-height: inherit;
        }
      `}</style>
      <Component {...pageProps} />
      <footer className="py-4 text-slate-800 text-sm">
        <p>
          Made with ❤️ by{" "}
          <Link
            className="hover:underline"
            href="https://github.com/julien040/"
          >
            Julien
          </Link>
        </p>

        <p>
          To contact me,
          <Link className="hover:underline" href="https://julienc.me/whoami">
            {" "}
            check my website
          </Link>
        </p>
        <br />
        <p>
          To learn more about the project, check the{" "}
          <Link
            className="hover:underline"
            href="https://julienc.me/articles/Extract_embeddings_Hacker_News_article"
          >
            blog post
          </Link>
        </p>
        <p className="italic">
          This is a personal project, not affiliated with Hacker News.
        </p>
      </footer>
      <Script
        src="https://sa.hn-recommend.julienc.me/latest.js"
        data-collect-dnt="true"
      />
      <noscript>
        {/* eslint-disable @next/next/no-img-element */}
        <img
          src="https://sa.hn-recommend.julienc.me/noscript.gif"
          alt=""
          referrerPolicy="no-referrer-when-downgrade"
        />
      </noscript>
    </>
  );
}
