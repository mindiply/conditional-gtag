declare module 'load-js' {
  interface IItemToLoadOptions {
    allowExternal?: boolean;
    async?: boolean;
    cache?: boolean;
    charset?: string;
    id?: string;
    text?: string;
    type?: string;
    url?: string;
  }

  type ItemToLoad = string | IItemToLoadOptions;

  function loadJs(prms: ItemToLoad | ItemToLoad[]): Promise<void>;
  export default loadJs;
}
