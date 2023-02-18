import invariant from "tiny-invariant";

type PluginEvents<CustomEvents extends Record<string, Record<string, string | number | boolean>>> =
  {
    query: { query: string };
    "change-query": { query: string; requery: boolean };
  } & CustomEvents;

type Awaitable<T> = T | PromiseLike<T>;

type PluginParameters = Array<string | number | boolean | Record<string, unknown>>;

type RPCResponse<Events, Event extends keyof Events> = {
  title: string;
  subtitle?: string;
  event?: Event;
  parameters?: Events[Event];
  context?: PluginParameters;
  dontHideAfterAction?: boolean;
  score?: number;
  icon?: string;
};

type PluginData<Events, Settings> = {
  method: keyof Events;
  parameters: PluginParameters;
  settings: Settings;
};

type Options = {
  args: string;
  icon?: string;
};

class Flow<
  Events extends Record<string, Record<string, string | number | boolean>>,
  Settings = Record<string, unknown>
> {
  private readonly data?: PluginData<PluginEvents<Events>, Settings> = undefined;
  private events = {} as Record<
    keyof PluginEvents<Events>,
    (parameters: PluginEvents<Events>[keyof PluginEvents<Events>]) => Awaitable<void>
  >;

  constructor({ args }: Options) {
    this.data = JSON.parse(args);
  }

  public on<K extends keyof PluginEvents<Events>>(
    event: K,
    listener: (parameters: PluginEvents<Events>[K]) => Awaitable<void>
  ): this {
    invariant(this.data?.parameters, "Parameters not defined");

    this.events[event] = listener.bind(this, this.data.parameters);

    return this;
  }

  public emit<K extends keyof PluginEvents<Events>>(
    event: K,
    parameters: PluginEvents<Events>[K]
  ): this {
    const params = Object.values(parameters);

    console.log(
      JSON.stringify({
        method: event,
        parameters: params,
      })
    );

    return this;
  }

  public show<E extends keyof PluginEvents<Events>>(
    ...results: RPCResponse<PluginEvents<Events>, E>[]
  ) {
    const result = results.map(
      ({ title, context, dontHideAfterAction, event, icon, parameters, subtitle, score }) => {
        const params = parameters ? Object.values(parameters) : [];

        return {
          Title: title,
          Subtitle: subtitle,
          Method: event,
          JsonRPCAction: {
            method: event,
            parameters: params,
            dontHideAfterAction: dontHideAfterAction || false,
          },
          ContextData: context || [],
          // TODO: default icon path
          IcoPath: icon,
          Score: score || 0,
        };
      }
    );

    console.log(JSON.stringify({ result }));
  }

  public run() {
    invariant(this.data?.method, "No event defined");
    invariant(this.events, "Events not initialized correctly");
    invariant(this.events[this.data.method], "Something went wrong");

    this.data?.method in this.events && this.events[this.data.method]();
  }
}

const plugin = new Flow<{ copy: { value: string }; open: { value: string } }>({
  args: "{}",
});

plugin.emit("change-query", { query: "hello world", requery: true });

plugin.on("query", ({ query }) => {
  console.log(query);

  plugin.show({
    event: "copy",
    parameters: {
      value: "",
    },
    title: "hello",
  });
});

plugin.on("open", ({ value }) => {
  console.log(value);
});

plugin.show({
  title: "Hello World",
  event: "change-query",
  parameters: {
    query: "hello world",
    requery: true,
  },
});

plugin.run();
