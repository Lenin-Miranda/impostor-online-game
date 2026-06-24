import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WebSocket } from 'ws';

// Node 20 has no global WebSocket, but supabase-js needs it when
// building the client (realtime module). We provide it via `ws`.
const g = globalThis as { WebSocket?: unknown };
if (typeof g.WebSocket === 'undefined') {
  g.WebSocket = WebSocket;
}

/**
 * Supabase client using the service_role key.
 * Use it ONLY on the backend (elevated permissions, never expose it to the client).
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
        '⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not defined. ' +
          'The Supabase client will not work until they are configured.',
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
