import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService, FactorMfa } from '../../../core/services/auth.service';
import { ConfiguracionService } from '../../../core/services/configuracion.service';
import { esUrlValida } from '../../../core/utils/validar-url';

interface FormCasillero {
  envio_casillero_habilitado: boolean;
  casillero_nombre: string;
  casillero_direccion_linea1: string;
  casillero_direccion_linea2: string;
  casillero_ciudad: string;
  casillero_estado: string;
  casillero_cp: string;
  casillero_notas: string;
}

const CASILLERO_VACIO: FormCasillero = {
  envio_casillero_habilitado: false,
  casillero_nombre: '',
  casillero_direccion_linea1: '',
  casillero_direccion_linea2: '',
  casillero_ciudad: '',
  casillero_estado: '',
  casillero_cp: '',
  casillero_notas: '',
};

interface FormRedes {
  instagram_url: string;
  facebook_url: string;
}

const REDES_VACIO: FormRedes = {
  instagram_url: '',
  facebook_url: '',
};

@Component({
  selector: 'app-admin-configuracion',
  imports: [FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class AdminConfiguracion implements OnInit {
  protected readonly configuracion = inject(ConfiguracionService);
  private readonly auth = inject(AuthService);

  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly guardandoCasillero = signal(false);
  readonly casilleroGuardado = signal(false);
  readonly error = signal<string | null>(null);

  readonly formCasillero = signal<FormCasillero>({ ...CASILLERO_VACIO });
  readonly formRedes = signal<FormRedes>({ ...REDES_VACIO });
  readonly guardandoRedes = signal(false);
  readonly redesGuardadas = signal(false);

  // ---------- 2FA ----------
  readonly mfaFactores = signal<FactorMfa[]>([]);
  readonly mfaActivo = computed(() => this.mfaFactores().some((f) => f.status === 'verified'));
  readonly cargandoMfa = signal(true);
  readonly errorMfa = signal<string | null>(null);

  readonly activandoMfa = signal(false);
  readonly qrCodeMfa = signal<string | null>(null);
  readonly secretMfa = signal<string | null>(null);
  readonly factorIdPendiente = signal<string | null>(null);
  readonly codigoConfirmacion = signal('');
  readonly confirmandoMfa = signal(false);
  readonly desactivandoMfa = signal(false);

  ngOnInit(): void {
    this.cargarMfa();
    this.configuracion.cargar().subscribe({
      next: (c) => {
        this.formCasillero.set({
          envio_casillero_habilitado: c.envio_casillero_habilitado,
          casillero_nombre: c.casillero_nombre ?? '',
          casillero_direccion_linea1: c.casillero_direccion_linea1 ?? '',
          casillero_direccion_linea2: c.casillero_direccion_linea2 ?? '',
          casillero_ciudad: c.casillero_ciudad ?? '',
          casillero_estado: c.casillero_estado ?? '',
          casillero_cp: c.casillero_cp ?? '',
          casillero_notas: c.casillero_notas ?? '',
        });
        this.formRedes.set({
          instagram_url: c.instagram_url ?? '',
          facebook_url: c.facebook_url ?? '',
        });
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la configuración.');
        this.cargando.set(false);
      },
    });
  }

  toggleCarrito(): void {
    const nuevoValor = !this.configuracion.carritoHabilitado();
    this.guardando.set(true);
    this.error.set(null);

    this.configuracion.actualizar({ carrito_habilitado: nuevoValor }).subscribe({
      next: () => this.guardando.set(false),
      error: () => {
        this.error.set('No se pudo guardar el cambio. Intentá de nuevo.');
        this.guardando.set(false);
      },
    });
  }

  actualizarCampoCasillero<K extends keyof FormCasillero>(campo: K, valor: FormCasillero[K]): void {
    this.formCasillero.update((actual) => ({ ...actual, [campo]: valor }));
  }

  actualizarCampoRedes<K extends keyof FormRedes>(campo: K, valor: FormRedes[K]): void {
    this.formRedes.update((actual) => ({ ...actual, [campo]: valor }));
  }

  guardarRedes(): void {
    const datos = this.formRedes();
    if (!esUrlValida(datos.instagram_url) || !esUrlValida(datos.facebook_url)) {
      this.error.set('Los links de redes sociales tienen que ser URLs válidas (http:// o https://).');
      return;
    }

    this.guardandoRedes.set(true);
    this.error.set(null);

    this.configuracion
      .actualizar({
        instagram_url: datos.instagram_url.trim() || null,
        facebook_url: datos.facebook_url.trim() || null,
      })
      .subscribe({
        next: () => {
          this.guardandoRedes.set(false);
          this.redesGuardadas.set(true);
          setTimeout(() => this.redesGuardadas.set(false), 2500);
        },
        error: () => {
          this.guardandoRedes.set(false);
          this.error.set('No se pudieron guardar las redes sociales. Intentá de nuevo.');
        },
      });
  }

  guardarCasillero(): void {
    const datos = this.formCasillero();
    this.guardandoCasillero.set(true);
    this.error.set(null);

    this.configuracion
      .actualizar({
        envio_casillero_habilitado: datos.envio_casillero_habilitado,
        casillero_nombre: datos.casillero_nombre.trim() || null,
        casillero_direccion_linea1: datos.casillero_direccion_linea1.trim() || null,
        casillero_direccion_linea2: datos.casillero_direccion_linea2.trim() || null,
        casillero_ciudad: datos.casillero_ciudad.trim() || null,
        casillero_estado: datos.casillero_estado.trim() || null,
        casillero_cp: datos.casillero_cp.trim() || null,
        casillero_notas: datos.casillero_notas.trim() || null,
      })
      .subscribe({
        next: () => {
          this.guardandoCasillero.set(false);
          this.casilleroGuardado.set(true);
          setTimeout(() => this.casilleroGuardado.set(false), 2500);
        },
        error: () => {
          this.guardandoCasillero.set(false);
          this.error.set('No se pudo guardar la dirección. Intentá de nuevo.');
        },
      });
  }

  // ---------- 2FA ----------

  private cargarMfa(): void {
    this.cargandoMfa.set(true);
    this.auth.mfaListarFactores().subscribe({
      next: (factores) => {
        this.mfaFactores.set(factores);
        this.cargandoMfa.set(false);
      },
      error: () => {
        this.errorMfa.set('No se pudo cargar el estado de 2FA.');
        this.cargandoMfa.set(false);
      },
    });
  }

  iniciarActivacionMfa(): void {
    this.errorMfa.set(null);
    this.activandoMfa.set(true);
    this.auth.mfaEnrollar().subscribe({
      next: ({ factorId, qrCode, secret }) => {
        this.factorIdPendiente.set(factorId);
        this.qrCodeMfa.set(qrCode);
        this.secretMfa.set(secret);
      },
      error: () => {
        this.errorMfa.set('No se pudo iniciar la activación de 2FA. Intentá de nuevo.');
        this.activandoMfa.set(false);
      },
    });
  }

  confirmarActivacionMfa(): void {
    const factorId = this.factorIdPendiente();
    if (!factorId || this.codigoConfirmacion().trim().length !== 6) {
      this.errorMfa.set('Ingresá el código de 6 dígitos de tu app autenticadora.');
      return;
    }

    this.confirmandoMfa.set(true);
    this.errorMfa.set(null);
    this.auth.mfaConfirmarEnrolamiento(factorId, this.codigoConfirmacion().trim()).subscribe({
      next: () => {
        this.confirmandoMfa.set(false);
        this.cancelarActivacionMfa();
        this.cargarMfa();
      },
      error: () => {
        this.confirmandoMfa.set(false);
        this.errorMfa.set('Código incorrecto. Probá de nuevo.');
      },
    });
  }

  cancelarActivacionMfa(): void {
    this.activandoMfa.set(false);
    this.qrCodeMfa.set(null);
    this.secretMfa.set(null);
    this.factorIdPendiente.set(null);
    this.codigoConfirmacion.set('');
  }

  desactivarMfa(factorId: string): void {
    if (!confirm('¿Desactivar la verificación en dos pasos? Tu cuenta va a quedar protegida solo con la contraseña.')) {
      return;
    }
    this.desactivandoMfa.set(true);
    this.errorMfa.set(null);
    this.auth.mfaDesactivar(factorId).subscribe({
      next: () => {
        this.desactivandoMfa.set(false);
        this.cargarMfa();
      },
      error: () => {
        this.desactivandoMfa.set(false);
        this.errorMfa.set('No se pudo desactivar. Intentá de nuevo.');
      },
    });
  }
}
