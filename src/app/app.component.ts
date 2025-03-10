import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent implements OnInit, AfterViewInit {

  constructor(private router: ActivatedRoute, private encoder: Router){}

  title = 'Bloqueo Tarjetas Dbt';

  ngOnInit(): void {}

  ngAfterViewInit(): void{
    this.getParams();
  }

  async getParams() {
    await this.router.queryParamMap.subscribe((params) => {
      const Ppe = params.get('ppe');
      const Sid = params.get('sid');
      
      localStorage.setItem('ppe', Ppe ? Ppe : 'invalid');
      localStorage.setItem('sid', Sid ? Sid : 'invalid');
    });
  }
}
