import appInsights from 'applicationinsights';

export function initializeMonitor() {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connectionString) {
    console.log('Azure Monitor Connection String (APPLICATIONINSIGHTS_CONNECTION_STRING) not set. Skipping Monitor load.');
    return;
  }

  try {
    appInsights.setup(connectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .start();

    console.log('Azure Monitor Application Insights instrumentation completed successfully.');
  } catch (err) {
    console.error('Failed to initialize Azure Monitor App Insights:', err.message);
  }
}
