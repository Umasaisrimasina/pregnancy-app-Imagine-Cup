# Azure Application Insights Integration Guide

## Setup Complete ✅

Application Insights has been integrated into your pregnancy app with automatic tracking.

## Configuration

### 1. Get Your Connection String from Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Application Insights** → Create or select your resource
3. Go to **Overview** → Copy the **Connection String**
4. Add it to your `.env` file:

```env
VITE_APPINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxxxx;IngestionEndpoint=https://...
```

### 2. Automatic Tracking Enabled

The following events are automatically tracked:

- ✅ **Page Views** - Every page/view change
- ✅ **Route Changes** - Navigation between sections
- ✅ **User Login** - Phase and role selection
- ✅ **User Logout** - Session end
- ✅ **Page Visit Time** - Time spent on each page

## Manual Event Tracking

### In Components

Use the `useAppInsights` hook:

```tsx
import { useAppInsights } from '../hooks/useAppInsights';

function MyComponent() {
  const { trackEvent } = useAppInsights();

  const handleButtonClick = () => {
    trackEvent('Button_Clicked', {
      buttonName: 'Nutrition_Tips',
      phase: 'pregnancy'
    });
  };

  return <button onClick={handleButtonClick}>Click Me</button>;
}
```

### Common Events to Track

```tsx
// Button clicks
trackEvent('Button_Clicked', { buttonName: 'Save_Profile' });

// Feature usage
trackEvent('Feature_Used', { featureName: 'Calendar_View' });

// Content interactions
trackEvent('Article_Read', { 
  articleId: '123',
  category: 'nutrition' 
});

// Form submissions
trackEvent('Form_Submitted', { 
  formType: 'health_questionnaire',
  phase: 'pre-pregnancy'
});

// Translation/Language
trackEvent('Translate_Clicked', { 
  fromLanguage: 'en',
  toLanguage: 'es' 
});

// Errors (caught)
trackException(error, { 
  component: 'NutritionPage',
  action: 'fetchData' 
});

// Performance metrics
trackMetric('DataLoadTime', loadTimeMs, { 
  dataType: 'nutritionPlans' 
});
```

## Events Already Tracking

1. **User_Login** - When user selects phase and role
   - Properties: `phase`, `role`

2. **User_Logout** - When user logs out

3. **Page Views** - Automatically tracked for each view
   - Format: `{phase}_{view}`
   - Properties: `phase`, `view`, `role`

## View Data in Azure Portal

1. Go to **Application Insights** → Your resource
2. Navigate to:
   - **Usage** → Users, Sessions, Events
   - **Investigate** → Events (to see custom events)
   - **Monitoring** → Live Metrics
   - **Logs** → Run KQL queries

### Sample KQL Queries

**Top 10 events:**
```kql
customEvents
| summarize count() by name
| top 10 by count_
```

**User journey by phase:**
```kql
customEvents
| where name == "User_Login"
| summarize count() by tostring(customDimensions.phase)
```

**Page views over time:**
```kql
pageViews
| summarize count() by bin(timestamp, 1h)
| render timechart
```

## Best Practices

1. **Use descriptive event names** - PascalCase with underscores
2. **Add context with properties** - Include phase, role, IDs
3. **Track user flows** - Login → Feature Use → Conversion
4. **Monitor errors** - Use `trackException` in catch blocks
5. **Performance metrics** - Track load times with `trackMetric`

## Example: Full Feature Tracking

```tsx
import { useAppInsights } from '../hooks/useAppInsights';

function NutritionPlan() {
  const { trackEvent, trackException, trackMetric } = useAppInsights();

  const loadNutritionPlan = async () => {
    const startTime = performance.now();
    
    try {
      trackEvent('NutritionPlan_LoadStart');
      
      const data = await fetchPlan();
      
      const loadTime = performance.now() - startTime;
      trackMetric('NutritionPlan_LoadTime', loadTime);
      
      trackEvent('NutritionPlan_LoadSuccess', {
        planType: data.type,
        itemCount: data.items.length
      });
      
    } catch (error) {
      trackException(error as Error, {
        component: 'NutritionPlan',
        action: 'loadPlan'
      });
      
      trackEvent('NutritionPlan_LoadError', {
        errorMessage: (error as Error).message
      });
    }
  };

  return (
    <button onClick={loadNutritionPlan}>
      Load Plan
    </button>
  );
}
```

## Troubleshooting

- **No data appearing?** Check connection string in `.env`
- **Events not tracking?** Verify import of `./appInsights` in `index.tsx`
- **Duplicate events?** Check for React.StrictMode (causes double renders in dev)

## Files Modified

- ✅ [appInsights.ts](appInsights.ts) - Core tracking configuration
- ✅ [hooks/useAppInsights.ts](hooks/useAppInsights.ts) - React hook for tracking
- ✅ [App.tsx](App.tsx) - Automatic login/logout/navigation tracking
- ✅ [index.tsx](index.tsx) - Initialize Application Insights
- ✅ [.env](.env) - Connection string configuration
