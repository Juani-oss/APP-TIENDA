import { Component } from '@angular/core';

/**
 * Sprite de íconos lineales de RomVal Store (categorías, trust badges, etc.).
 * No renderiza nada visible: solo declara los <symbol> para que cualquier
 * componente los use con <svg><use href="#i-xxx"/></svg>.
 */
@Component({
  selector: 'app-icon-sprite',
  imports: [],
  templateUrl: './icon-sprite.html',
})
export class IconSprite {}
