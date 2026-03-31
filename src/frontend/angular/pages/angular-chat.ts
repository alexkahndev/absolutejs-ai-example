import { Component } from "@angular/core";
import { ChatComponent } from "../components/chat.component";

@Component({
  imports: [ChatComponent],
  selector: "angular-chat",
  standalone: true,
  template: `
    <header>
      <a href="/">React</a>
      <a href="/svelte">Svelte</a>
      <a href="/vue">Vue</a>
      <a class="active" href="/angular">Angular</a>
      <a href="/html">HTML</a>
      <a href="/htmx">HTMX</a>
    </header>
    <app-chat />
  `,
})
export class AngularChatPage {}
