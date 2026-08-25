import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from '../../shared/components/footer/footer';
import { IconSprite } from '../../shared/components/icon-sprite/icon-sprite';
import { Navbar } from '../../shared/components/navbar/navbar';
import { WhatsappFloat } from '../../shared/components/whatsapp-float/whatsapp-float';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Navbar, Footer, IconSprite, WhatsappFloat],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {}
