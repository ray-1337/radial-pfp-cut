// mantine
import { MantineProvider } from "@mantine/core";

import "normalize.css";

import "@mantine/core/styles.css";

import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider>
      <Component {...pageProps} />
    </MantineProvider>
  );
};