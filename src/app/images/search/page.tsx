"use client";

import React, { useState } from "react";
import Head from "next/head";

import { ImageResult, getSearchSymbols } from "@/api/imageSearch";

function SymbolImage(props: { symbol: ImageResult }) {
  const { symbol } = props;

  return (
    <div className="rounded-md border-2 p-2 m-2 b-1">
      <img className="w-32" src={symbol.url} />
      <div>
        <a className="text-blue-600" href={symbol.url}>
          {symbol.url}
        </a>
      </div>
    </div>
  );
}

function renderSymbol(symbol: ImageResult, i: number): React.ReactNode {
  return <SymbolImage key={i} symbol={symbol} />;
}

export default function ImageSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [imageResults, setImageResults] = useState<ImageResult[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const doSearch = async () => {
    setIsFetching(true);
    try {
      const results = await getSearchSymbols(searchTerm);
      setIsFetching(false);
      setImageResults(results || []);
    } catch (error) {
      setIsFetching(false);
      setImageResults([]);
    }
  };

  const onChangeSearchTerm = (event: React.ChangeEvent<HTMLInputElement>) => {
    let text = event.target.value;
    setSearchTerm(text);
  };

  const onKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      doSearch();
    }
  };

  const onClickSearch = async () => {
    doSearch();
  };

  return (
    <>
      <Head>
        <title>GibTalk: Search Images</title>
        <meta name="description" content="GibTalk search images" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main>
        <div className="bg-white">
          <div className="container mx-auto max-w-screen-lg p-10">
            <p className="text-4xl">Search</p>

            <div>
              <input
                className="border"
                type="text"
                onChange={onChangeSearchTerm}
                onKeyDown={onKeyDown}
                value={searchTerm}
              />
              <button
                type="button"
                onClick={onClickSearch}
                className="rounded border-2 px-4 m-2"
              >
                Search
              </button>
            </div>

            <div>
              {isFetching ? (
                <p>Loading...</p>
              ) : (
                <>{imageResults.map(renderSymbol)}</>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
