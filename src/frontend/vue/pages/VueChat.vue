<script setup lang="ts">
import Chat from "../components/Chat.vue";
</script>

<template>
  <header>
    <a href="/">React</a>
    <a href="/svelte">Svelte</a>
    <a class="active" href="/vue">Vue</a>
    <a href="/angular">Angular</a>
    <a href="/html">HTML</a>
    <a href="/htmx">HTMX</a>
  </header>
  <Chat />
</template>
