import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
