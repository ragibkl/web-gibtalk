import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>GibTalk</title>
        <meta name="description" content="GibTalk" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main>
        <div className="bg-white">
          <div className="container m-auto max-w-screen-lg p-10 min-h-screen">
            <p className="text-5xl">GibTalk</p>
            <p className="my-2">Welcome to GibTalk</p>

            <Link href={"images/search"}>
              <p className="text-blue-600">Search Images</p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
