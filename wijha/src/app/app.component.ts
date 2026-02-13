import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LineListComponent } from "./components/line-list/line-list.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LineListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'wijha';
}
