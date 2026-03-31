<script lang="ts">
  import { createAIStream } from "@absolutejs/absolute/svelte/ai";

  const PROVIDERS = ["anthropic", "openai", "ollama"];
  let provider = $state("anthropic");
  const stream = createAIStream("/chat");
  let inputValue = $state("");

  const handleSubmit = (evt: Event) => {
    evt.preventDefault();
    const value = inputValue.trim();
    if (!value) return;
    stream.send(`${provider}:${value}`);
    inputValue = "";
  };
</script>

<div class="chat-container">
  <div class="provider-selector">
    {#each PROVIDERS as prov}
      <button
        class:active={prov === provider}
        onclick={() => (provider = prov)}
        type="button"
      >
        {prov}
      </button>
    {/each}
  </div>

  <div class="messages">
    {#if stream.messages.length === 0}
      <div class="empty-state">
        Send a message to start chatting. Try "What's the weather in Tokyo?"
      </div>
    {/if}
    {#each stream.messages as msg (msg.id)}
      <div class="message" data-role={msg.role}>
        {msg.content}
        {#if msg.isStreaming}<span class="cursor"></span>{/if}
        {#if msg.toolCalls}
          {#each msg.toolCalls as tool}
            <div class="tool-status" class:running={!tool.result}>
              {tool.result ? `${tool.name}: ${tool.result}` : `Running ${tool.name}...`}
            </div>
          {/each}
        {/if}
      </div>
    {/each}
  </div>

  {#if stream.error}
    <div class="tool-status running">Error: {stream.error}</div>
  {/if}

  <form class="chat-form" onsubmit={handleSubmit}>
    <input
      autocomplete="off"
      bind:value={inputValue}
      disabled={stream.isStreaming}
      name="input"
      placeholder={`Ask ${provider} anything...`}
    />
    {#if stream.isStreaming}
      <button class="cancel" onclick={() => stream.cancel()} type="button">Stop</button>
    {:else}
      <button type="submit">Send</button>
    {/if}
  </form>
</div>
