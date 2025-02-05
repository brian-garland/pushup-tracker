module.exports = {
  apps: [{
    name: 'pushup-tracker',
    script: 'ts-node',
    args: 'src/server.ts',
    watch: ['src'],
    ignore_watch: ['node_modules', 'client'],
    instances: 1,
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 5001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    time: true
  }]
}; 