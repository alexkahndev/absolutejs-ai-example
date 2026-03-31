import { Chat } from "../components/Chat";
import { Head } from "../components/Head";

type ReactChatProps = {
  cssPath?: string;
};

export const ReactChat = ({ cssPath }: ReactChatProps) => (
  <html>
    <Head cssPath={cssPath} />
    <body>
      <header>
        <a className="active" href="/">
          React
        </a>
        <a href="/svelte">Svelte</a>
        <a href="/vue">Vue</a>
        <a href="/angular">Angular</a>
        <a href="/html">HTML</a>
        <a href="/htmx">HTMX</a>
      </header>
      <Chat />
    </body>
  </html>
);
