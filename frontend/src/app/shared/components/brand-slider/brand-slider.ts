import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Marca } from '../../../core/models/marca.model';
import { resolverImagenUrl } from '../../../core/utils/imagen-url';

@Component({
  selector: 'app-brand-slider',
  imports: [RouterLink],
  templateUrl: './brand-slider.html',
  styleUrl: './brand-slider.scss',
})
export class BrandSlider {
  readonly marcas = input.required<Marca[]>();

  /** Duplicamos la lista para lograr un loop de marquee sin cortes. */
  readonly loopMarcas = computed(() => {
    const marcas = this.marcas();
    return marcas.length > 0 ? [...marcas, ...marcas] : [];
  });

  protected readonly resolverImagenUrl = resolverImagenUrl;
}
