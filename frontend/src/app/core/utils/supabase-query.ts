import { Observable, defer, from, map } from 'rxjs';

/**
 * Convierte una query de Supabase (que resuelve a {data, error}) en un
 * Observable, lanzando el error si lo hay — así los servicios migrados
 * mantienen el mismo comportamiento que antes con HttpClient (error en el
 * subscribe si algo falla).
 */
export function supabaseObservable<T>(
  query: PromiseLike<{ data: unknown; error: { message: string } | null }>
): Observable<T> {
  return defer(() =>
    from(query).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data as T;
      })
    )
  );
}
