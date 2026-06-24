import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WebSocket } from 'ws';

// Node 20 no incluye WebSocket global, pero supabase-js lo necesita al
// construir el cliente (módulo realtime). Se lo proveemos con `ws`.
const g = globalThis as { WebSocket?: unknown };
if (typeof g.WebSocket === 'undefined') {
  g.WebSocket = WebSocket;
}

/**
 * Cliente de Supabase con la service_role key.
 * Úsalo SOLO en el backend (tiene permisos elevados, nunca lo expongas al cliente).
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      console.warn(
        '⚠️  SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no definidos. ' +
          'El cliente de Supabase no funcionará hasta configurarlos.',
      );
      return;
    }

    this.client = createClient(url, key, {
      auth: { persistSession: false },
    });
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
