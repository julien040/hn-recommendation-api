import type { Post } from "../pages";
import Image from "next/image";
import Link from "next/link";
import { format } from "timeago.js";

const PostComponent = ({ post }: { post: Post }) => {
  const domain = new URL(post.url).hostname;
  return (
    <div className="flex gap-4 bg-white/30 rounded-xl p-4">
      <Image
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=256`}
        width={32}
        height={32}
        className="w-8 h-8 rounded-full"
        alt={"Logo " + domain}
      />
      <div>
        <Link href={post.url}>
          <h2 className="text-sm">{post.title}</h2>
        </Link>

        <div className="text-black/60 text-sm mt-2">
          <Link
            className="hover:underline"
            href={`https://news.ycombinator.com/item?id=${post.id}`}
          >
            {post.score} points
          </Link>
          {" by "}
          <Link
            className="hover:underline"
            href={`https://news.ycombinator.com/user?id=${post.author}`}
          >
            {post.author}
          </Link>
          {" | "}
          <Link
            className="hover:underline"
            href={`https://news.ycombinator.com/item?id=${post.id}`}
          >
            {post.comments} comments
          </Link>
          {" | "}
          <Link
            className="hover:underline"
            href={`https://news.ycombinator.com/item?id=${post.id}`}
          >
            {format(post.time * 1000)}
          </Link>
          {" | "}
          <Link
            className="hover:underline"
            href={`/?q=${encodeURIComponent(post.url)}`}
          >
            <span className="text-black/60">related</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostComponent;
