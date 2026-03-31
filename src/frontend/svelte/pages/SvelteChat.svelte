<script lang="ts">
  import { Head } from "@absolutejs/absolute/svelte/components/Head.js";
  import Chat from "../components/Chat.svelte";

  type SvelteChatProps = {
    cssPath?: string;
  };

  let { cssPath }: SvelteChatProps = $props();
</script>

<Head
  title="AbsoluteJS AI Chat - Svelte"
  description="AI streaming demo with Svelte"
  {cssPath}
/>

<header>
  <a href="/">React</a>
  <a class="active" href="/svelte">Svelte</a>
  <a href="/vue">Vue</a>
  <a href="/angular">Angular</a>
  <a href="/html">HTML</a>
  <a href="/htmx">HTMX</a>
</header>

<Chat />
