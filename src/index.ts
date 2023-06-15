let useGTags = false;
let propertyId: string | null = null;

export interface TrackingAllowedFn {
  (): boolean;
}

let isTrackingAllowedFn: null | TrackingAllowedFn = null;

export enum GTagCommand {
  CONFIG = 'config',
  EVENT = 'event',
  JS = 'js',
  SET = 'set',
  CONSENT = 'consent'
}

interface IConfigParameters {
  allow_ad_personalization_signals?: boolean;
  anonymize_ip?: boolean;
  cookie_domain?: string;
  cookie_expires?: number;
  cookie_prefix?: string;
  cookie_update?: boolean;
  custom_map?: {
    dimension1?: string;
    dimension2?: string;
    dimension3?: string;
    dimension4?: string;
    dimension5?: string;
    dimension6?: string;
    dimension7?: string;
    dimension8?: string;
    dimension9?: string;
    metric1?: string;
    metric2?: string;
    metric3?: string;
    metric4?: string;
    metric5?: string;
    metric6?: string;
    metric7?: string;
    metric8?: string;
    metric9?: string;
  };
  link_attribution?:
    | boolean
    | {
        cookie_expires: number;
        cookie_name: string;
        levels: number;
      };
  linker?: {
    accept_incoming?: boolean;
    domains?: string[];
  };
  page_title?: string;
  page_location?: string;
  page_path?: string;
  send_page_view?: boolean;
  user_id?: string;
}

interface IEventParameters {
  event_category?: string;
  event_label?: string;
  non_interaction?: boolean;
  value?: number;
}

interface IScreenViewParameters {
  screen_name: string;
  app_name: string;
  app_id?: string;
  app_version?: string;
  app_installer_id?: string;
}

interface ITimingParameters {
  name: string;
  value: number;
  event_category?: string;
  event_label?: string;
}

interface IExceptionParameters {
  description?: string;
  fatal?: boolean;
}

interface ConsentParameters {
  analytics_storage?: 'granted' | 'denied';
  ad_storage?: 'granted' | 'denied';
  ads_data_redaction?: boolean;
  region?: string[];
}

declare let USE_GTAGS: undefined | boolean;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[];
    GTAG_PROPERTY_ID?: string;
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars,no-unused-vars */
export function gtag(
  cmd: GTagCommand,
  qualifier: string | Date,
  prms?:
    | IExceptionParameters
    | ITimingParameters
    | IScreenViewParameters
    | IEventParameters
    | IConfigParameters
    | PropIdConditionalGTagsOptions
    | ConsentParameters
    | string
): void {
  /* eslint-enable @typescript-eslint/no-unused-vars,no-unused-vars */
  if (!(useGTags && propertyId)) {
    return;
  }
  if (typeof window !== 'undefined') {
    // We check at each gtag call whether to disable gtag or not the collection, because consent may be given
    // afterward
    // @ts-expect-error no typing provided for GA disable property
    window[`ga-disable-${propertyId}`] = Boolean(
      isTrackingAllowedFn && !isTrackingAllowedFn()
    );

    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  }
}

export interface ConditionalGTagsOptions {
  /** If set to true, gtag will not automatically send a pageView on initial page load. */
  disableInitialPageView?: boolean;

  /** If set, initGTag will call this function to determine whether Google code should be enabled at all or not.
   * If the function is set and returns false, the window[`ga-disable-${propertyId}`] property is set to true, before
   * any further analytics code. */
  isTrackingAllowedFn?: TrackingAllowedFn | null;

  /** Callback function that can use the google gtag function for initial configuration purposes, like setting consent or other google configuration */
  startupDefaultCmds?: (gtagFn: typeof gtag) => void;
}

/**
 * Options that can be passed to initGTag to personalize how it works
 */
export interface PropIdConditionalGTagsOptions extends ConditionalGTagsOptions {
  /** If set, called first to determine whether to enable or not Google analytics. It is only used if propertyId is also set. */
  checkFn?: () => boolean;
  disableGlobalScopeCheck?: boolean;

  locationRegEx?: RegExp;

  /** Allows setting the Google propertyId, rather than look for the global scope variable GTAG_PROPERTY_ID */
  propertyId: string;
}

/**
 * Initialization of conditionalTags.
 *
 * To determine the Google propertyId we have two main options:
 *
 * 1. use he propId initialization parameter
 * 2. If propId is not set, look at the global scope variable GTAG_PROPERTY_ID
 *
 * If neither is set, no google code will be called.
 *
 * @param {ConditionalGTagsOptions | PropIdConditionalGTagsOptions} options
 * @returns {Promise<void>}
 */
export async function initGTag(
  options: ConditionalGTagsOptions | PropIdConditionalGTagsOptions = {}
): Promise<void> {
  const {
    checkFn,
    disableGlobalScopeCheck = false,
    disableInitialPageView = false,
    isTrackingAllowedFn: trackingAllowedFn = null,
    locationRegEx,
    propertyId: propId,
    startupDefaultCmds
  } = options as PropIdConditionalGTagsOptions;
  isTrackingAllowedFn = trackingAllowedFn;
  try {
    if (typeof window === 'undefined') return;
    if (!propId) {
      if (window.GTAG_PROPERTY_ID) {
        propertyId = window.GTAG_PROPERTY_ID;
        useGTags = true;
      } else {
        return;
      }
    } else {
      propertyId = propId;
      if (checkFn && typeof checkFn === 'function') {
        useGTags = checkFn();
        if (!useGTags) return;
      }
      if (!disableGlobalScopeCheck) {
        if (typeof USE_GTAGS !== 'undefined') {
          if (!USE_GTAGS) return;
          useGTags = useGTags || USE_GTAGS === true;
        }
      }
      if (locationRegEx && locationRegEx instanceof RegExp) {
        if (!locationRegEx.test(window.location.host)) {
          return;
        }
        useGTags = true;
      }
      if (!useGTags) return;
    }
    // @ts-expect-error no typing provided for GA disable property
    window[`ga-disable-${propertyId}`] = Boolean(
      isTrackingAllowedFn && !isTrackingAllowedFn()
    );
    if (startupDefaultCmds) {
      try {
        startupDefaultCmds(gtag);
      } catch (err) {
        // silently swallow
      }
    }
    const loadJs = (await import('load-js')).default;
    loadJs({
      url: `https://www.googletagmanager.com/gtag/js?id=${propertyId}`,
      async: true
    })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .then(() => {})
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
    gtag(GTagCommand.JS, new Date());
    if (disableInitialPageView) {
      gtag(GTagCommand.CONFIG, propertyId, {send_page_view: false});
    } else {
      gtag(GTagCommand.CONFIG, propertyId);
    }
  } catch (err) {
    // Silent swallow
  }
}

export function recordScreenRender(appName: string, screenName: string): void {
  try {
    gtag(GTagCommand.EVENT, 'screen_view', {
      app_name: appName,
      screen_name: screenName
    });
  } catch (err) {
    // Silently swallow exception
  }
}

export function recordEvent(
  action: string,
  category?: string,
  label?: string,
  value?: number
): void {
  try {
    const prms: Partial<IEventParameters> = {};
    if (category) {
      prms.event_category = category;
    }
    if (label) {
      prms.event_label = label;
    }
    if (value) {
      prms.value = value;
    }
    gtag(GTagCommand.EVENT, action, prms);
  } catch (err) {
    // Silently Swallow
  }
}

let oldView: string | null = null;
export function recordNewView(viewPath?: string): void {
  try {
    const viewToRecord =
      viewPath ||
      (typeof window !== 'undefined' ? window.location.pathname : 'default');
    if (oldView !== viewToRecord) {
      oldView = viewToRecord;
      if (viewPath) {
        gtag(GTagCommand.SET, 'page_path', viewPath);
        gtag(GTagCommand.EVENT, 'page_view');
      }
    }
  } catch (err) {
    // silently swallow
  }
}

if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}
