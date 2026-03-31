import { Elysia } from "elysia";
import {
  handleReactPageRequest,
  handleHTMLPageRequest,
  handleHTMXPageRequest,
  generateHeadElement,
  asset,
} from "@absolutejs/absolute";
import { handleAngularPageRequest } from "@absolutejs/absolute/angular";
import { handleSveltePageRequest } from "@absolutejs/absolute/svelte";
import { handleVuePageRequest } from "@absolutejs/absolute/vue";
import { ReactChat } from "../../frontend/react/pages/ReactChat";

export const pagesPlugin = (manifest: Record<string, string>) =>
  new Elysia()
    .get("/", () =>
      handleReactPageRequest(
        ReactChat,
        asset(manifest, "ReactChatIndex"),
        {
          cssPath: asset(manifest, "ChatCSS"),
        },
      ),
    )
    .get("/svelte", async () => {
      const SvelteChat = (
        await import("../../frontend/svelte/pages/SvelteChat.svelte")
      ).default;

      return handleSveltePageRequest(
        SvelteChat,
        asset(manifest, "SvelteChat"),
        asset(manifest, "SvelteChatIndex"),
        {
          cssPath: asset(manifest, "ChatCSS"),
        },
      );
    })
    .get("/vue", async () => {
      const { VueChat } = (await import("../vueImporter")).vueImports;

      return handleVuePageRequest(
        VueChat,
        asset(manifest, "VueChat"),
        asset(manifest, "VueChatIndex"),
        generateHeadElement({
          cssPath: asset(manifest, "ChatCSS"),
          title: "AbsoluteJS AI Chat - Vue",
        }),
      );
    })
    .get("/html", () => handleHTMLPageRequest(asset(manifest, "HtmlChat")))
    .get("/htmx", () => handleHTMXPageRequest(asset(manifest, "HtmxChat")))
    .get("/angular", async () =>
      handleAngularPageRequest(
        () => import("../../frontend/angular/pages/angular-chat"),
        asset(manifest, "AngularChat"),
        asset(manifest, "AngularChatIndex"),
        generateHeadElement({
          cssPath: asset(manifest, "ChatCSS"),
          title: "AbsoluteJS AI Chat - Angular",
        }),
      ),
    );
