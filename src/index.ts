import loadJs from 'load-js';

let useGTags = false;
let propertyId: string | null = null;

enum GTagCommand {
  CONFIG = 'config',
  EVENT = 'event',
  JS = 'js',
  SET = 'set'
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

interface IGTagFn {
  (cmd: GTagCommand.JS, when: Date): void;
  (cmd: GTagCommand.CONFIG, propertyId: string, prms?: IConfigParameters): void;
  (
    cmd: GTagCommand.EVENT,
    action: 'screen_view',
    prms: IScreenViewParameters
  ): void;
  (
    cmd: GTagCommand.EVENT,
    action: 'timing_complete',
    prms: ITimingParameters
  ): void;
  (
    cmd: GTagCommand.EVENT,
    action: 'exception',
    prms?: IExceptionParameters
  ): void;
  (cmd: GTagCommand.EVENT, action: string, prms?: IEventParameters): void;
  (
    cmd: GTagCommand.EVENT,
    action: string,
    stats: {[statName: string]: string | number}
  ): void;
}

declare let USE_GTAGS: undefined | boolean;

declare global {
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[];
    GTAG_PROPERTY_ID?: string;
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars,no-unused-vars */
function gtag(
  cmd: GTagCommand,
  qualifier: string | Date,
  prms?:
    | IExceptionParameters
    | ITimingParameters
    | IScreenViewParameters
    | IEventParameters
    | IConfigParameters
    | IConditionalGTagsOptions
): void {
  /* eslint-enable @typescript-eslint/no-unused-vars,no-unused-vars */
  if (!(useGTags && propertyId)) {
    return;
  }
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  }
}

export interface IConditionalGTagsOptions {
  checkFn?: () => boolean;
  disableGlobalScopeCheck?: boolean;
  disableInitialPageView?: boolean;
  locationRegEx?: RegExp;
  propertyId?: string;
}

export function initGTag({
  checkFn,
  disableGlobalScopeCheck = false,
  disableInitialPageView = false,
  locationRegEx,
  propertyId: propId
}: IConditionalGTagsOptions = {}): void {
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
  window.dataLayer = window.dataLayer || [];
  loadJs({
    url: `https://www.googletagmanager.com/gtag/js?id=${propertyId}`,
    async: true
  })
    .then(() => {})
    .catch(() => {});
  gtag(GTagCommand.JS, new Date());
  if (disableInitialPageView) {
    gtag(
      GTagCommand.CONFIG,
      propertyId,
      // eslint-disable-next-line @typescript-eslint/camelcase
      {send_page_view: false}
    );
  } else {
    gtag(GTagCommand.CONFIG, propertyId);
  }
}

export function recordScreenRender(appName: string, screenName: string): void {
  try {
    gtag(GTagCommand.EVENT, 'screen_view', {
      // eslint-disable-next-line @typescript-eslint/camelcase
      app_name: appName,
      // eslint-disable-next-line @typescript-eslint/camelcase
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
      // eslint-disable-next-line @typescript-eslint/camelcase
      prms.event_category = category;
    }
    if (label) {
      // eslint-disable-next-line @typescript-eslint/camelcase
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
export function recordNewView(view?: string): void {
  try {
    const viewToRecord =
      view ||
      (typeof window !== 'undefined' ? window.location.pathname : 'default');
    if (oldView !== viewToRecord) {
      oldView = viewToRecord;
      if (view) {
        gtag(GTagCommand.CONFIG, propertyId || 'default', {
          // eslint-disable-next-line @typescript-eslint/camelcase
          page_path: viewToRecord
        });
      }
    }
  } catch (err) {
    // silently swallow
  }
}
