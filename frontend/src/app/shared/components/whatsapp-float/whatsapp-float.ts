import { Component } from '@angular/core';

import { whatsappHref } from '../../../core/utils/whatsapp';

const MENSAJE_ASESORIA =
  '¡Hola! Antes de comprar en RomVal Store quiero hacer una consulta 🙂';

@Component({
  selector: 'app-whatsapp-float',
  imports: [],
  templateUrl: './whatsapp-float.html',
  styleUrl: './whatsapp-float.scss',
})
export class WhatsappFloat {
  protected readonly href = whatsappHref(MENSAJE_ASESORIA);
}
