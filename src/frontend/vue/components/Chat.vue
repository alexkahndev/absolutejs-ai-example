<script setup lang="ts">
import { ref } from "vue";
import { useAIStream } from "@absolutejs/absolute/vue/ai";

const PROVIDERS = ["anthropic", "openai", "ollama"];
const provider = ref("anthropic");
const inputValue = ref("");

const { messages, send, cancel, isStreaming, error } = useAIStream("/chat");

const handleSubmit = (evt: Event) => {
  evt.preventDefault();
  const value = inputValue.value.trim();
  if (!value) return;
  send(`${provider.value}:${value}`);
  inputValue.value = "";
};
</script>

<template>
  <div class="chat-container">
    <div class="provider-selector">
      <button
        v-for="prov in PROVIDERS"
        :key="prov"
        :class="{ active: prov === provider }"
        type="button"
        @click="provider = prov"
      >
        {{ prov }}
      </button>
    </div>

    <div class="messages">
      <div v-if="messages.length === 0" class="empty-state">
        Send a message to start chatting. Try "What's the weather in Tokyo?"
      </div>
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message"
        :data-role="msg.role"
      >
        {{ msg.content }}
        <span v-if="msg.isStreaming" class="cursor" />
        <template v-if="msg.toolCalls">
          <div
            v-for="tool in msg.toolCalls"
            :key="`${msg.id}-${tool.name}`"
            class="tool-status"
            :class="{ running: !tool.result }"
          >
            {{ tool.result ? `${tool.name}: ${tool.result}` : `Running ${tool.name}...` }}
          </div>
        </template>
      </div>
    </div>

    <div v-if="error" class="tool-status running">Error: {{ error }}</div>

    <form class="chat-form" @submit="handleSubmit">
      <input
        v-model="inputValue"
        autocomplete="off"
        :disabled="isStreaming"
        name="input"
        :placeholder="`Ask ${provider} anything...`"
      />
      <button v-if="isStreaming" class="cancel" type="button" @click="cancel">
        Stop
      </button>
      <button v-else type="submit">Send</button>
    </form>
  </div>
</template>
