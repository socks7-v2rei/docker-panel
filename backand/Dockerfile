FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    supervisor \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ۱. repocket (nojsen)
COPY --from=sweadent/nojsen:latest / /nojsen/

# ۲. fjcrose
COPY --from=moshitan/fjcrose-custom:latest / /fjcrose/
RUN mkdir -p /app && \
    cp /fjcrose/app/config.json /app/config.json && \
    cp /fjcrose/app/main /app/main && \
    chmod +x /app/main

# ۳. traffmonetizer
COPY --from=traffmonetizer/cli_v2:latest /usr/local/bin/cli /usr/local/bin/cli
RUN chmod +x /usr/local/bin/cli

# supervisord
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

WORKDIR /
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
