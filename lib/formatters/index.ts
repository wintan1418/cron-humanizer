// Registry of per-target snippet formatters. Each format takes a validated
// 5-field cron expression and returns the snippet string to put on clipboard.

export interface Format {
  id: string;
  name: string;
  language: string; // for syntax class hints, not parsed
  filename: string;
  note?: string;
  render: (cron: string) => string;
}

const linux: Format = {
  id: "linux",
  name: "Linux",
  language: "shell",
  filename: "crontab",
  render: (cron) => `${cron} /path/to/command`,
};

const gha: Format = {
  id: "gha",
  name: "GitHub Actions",
  language: "yaml",
  filename: ".github/workflows/schedule.yml",
  note:
    "GitHub Actions schedules run in UTC. Translate this expression from your preferred zone into UTC before pasting, or the job will fire at the wrong clock time.",
  render: (cron) =>
    `on:
  schedule:
    - cron: '${cron}'`,
};

const rails: Format = {
  id: "rails",
  name: "Rails",
  language: "ruby",
  filename: "config/schedule.rb",
  render: (cron) =>
    `every '${cron}' do
  rake 'my_task'
end`,
};

const k8s: Format = {
  id: "k8s",
  name: "Kubernetes",
  language: "yaml",
  filename: "cronjob.yaml",
  render: (cron) =>
    `apiVersion: batch/v1
kind: CronJob
metadata:
  name: my-job
spec:
  schedule: "${cron}"
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: worker
              image: my/image:latest`,
};

const vercel: Format = {
  id: "vercel",
  name: "Vercel",
  language: "json",
  filename: "vercel.json",
  render: (cron) =>
    `{
  "crons": [
    { "path": "/api/cron", "schedule": "${cron}" }
  ]
}`,
};

const node: Format = {
  id: "node",
  name: "node-cron",
  language: "javascript",
  filename: "cron.js",
  render: (cron) =>
    `import cron from 'node-cron';

cron.schedule('${cron}', () => {
  // ...your task
});`,
};

const python: Format = {
  id: "python",
  name: "Python",
  language: "python",
  filename: "scheduler.py",
  note: "APScheduler signature — celery beat users: wrap with crontab(...).",
  render: (cron) =>
    `from apscheduler.triggers.cron import CronTrigger

trigger = CronTrigger.from_crontab('${cron}')`,
};

export const FORMATS: Format[] = [linux, gha, rails, k8s, vercel, node, python];

export function getFormat(id: string): Format | undefined {
  return FORMATS.find((f) => f.id === id);
}
