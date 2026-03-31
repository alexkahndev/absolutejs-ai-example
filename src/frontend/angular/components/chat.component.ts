import { Component, signal, computed, inject } from "@angular/core";
import { NgClass } from "@angular/common";
import { AIStreamService } from "@absolutejs/absolute/angular/ai";

const PROVIDERS = ["anthropic", "openai", "ollama"];

@Component({
  imports: [NgClass],
  selector: "app-chat",
  standalone: true,
  template: `
    <div class="chat-container">
      <div class="provider-selector">
        @for (prov of providers; track prov) {
          <button
            [ngClass]="{ active: prov === provider() }"
            (click)="provider.set(prov)"
            type="button"
          >
            {{ prov }}
          </button>
        }
      </div>

      <div class="messages">
        @if (chat.messages().length === 0) {
          <div class="empty-state">
            Send a message to start chatting. Try "What's the weather in Tokyo?"
          </div>
        }
        @for (msg of chat.messages(); track msg.id) {
          <div class="message" [attr.data-role]="msg.role">
            {{ msg.content }}
            @if (msg.isStreaming) { <span class="cursor"></span> }
            @if (msg.toolCalls) {
              @for (tool of msg.toolCalls; track tool.name) {
                <div class="tool-status" [ngClass]="{ running: !tool.result }">
                  {{ tool.result ? tool.name + ': ' + tool.result : 'Running ' + tool.name + '...' }}
                </div>
              }
            }
          </div>
        }
      </div>

      @if (chat.error()) {
        <div class="tool-status running">Error: {{ chat.error() }}</div>
      }

      <form class="chat-form" (submit)="handleSubmit($event)">
        <input
          autocomplete="off"
          [disabled]="chat.isStreaming()"
          name="input"
          [placeholder]="'Ask ' + provider() + ' anything...'"
          #chatInput
        />
        @if (chat.isStreaming()) {
          <button class="cancel" (click)="chat.cancel()" type="button">Stop</button>
        } @else {
          <button type="submit">Send</button>
        }
      </form>
    </div>
  `,
})
export class ChatComponent {
  providers = PROVIDERS;
  provider = signal("anthropic");

  private aiService = inject(AIStreamService);
  chat = this.aiService.connect("/chat");

  handleSubmit(evt: Event) {
    evt.preventDefault();
    const form = evt.target as HTMLFormElement;
    const input = form.elements.namedItem("input") as HTMLInputElement;
    const value = input.value.trim();

    if (!value) {
      return;
    }

    this.chat.send(`${this.provider()}:${value}`);
    input.value = "";
  }
}
