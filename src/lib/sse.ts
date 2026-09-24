/**
 * Reads a fetch Response body as Server-Sent Events and yields the raw
 * payload of each "data: ..." line. Handles chunks that split a line or an
 * event across reads.
 */
export async function* readSSE(response: Response): AsyncGenerator<string> {
  const body = response.body
  if (!body) return
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payload = trimmed.slice(5).trim()
        if (payload) yield payload
      }
    }
  } finally {
    reader.releaseLock()
  }
}
