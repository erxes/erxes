fn supergraph_service(service) {
  let add_cookies_to_response = |response| {
    if response.context["set_cookie_headers"] != () && !response.context["set_cookie_headers"].is_empty() {
      response.headers["set-cookie"] += response.context["set_cookie_headers"];
    }

    // Somehow this is causing @defer not to work
    // if response.context["server_timing_headers"] != () && !response.context["server_timing_headers"].is_empty() {
    //   response.headers["server-timing"] += response.context["server_timing_headers"];
    // }
  };

  let add_server_timing_to_response = |response| {
    if response.context["server_timing_headers"] != () && !response.context["server_timing_headers"].is_empty() {
      response.headers["server-timing"] += response.context["server_timing_headers"];
    }
  };

  service.map_response(add_cookies_to_response);
}

fn subgraph_service(service, subgraph) {
  let store_cookies_from_subgraphs = |response| {
    if !response.headers.values("set-cookie").is_empty() { 
      response.context.set_cookie_headers = response.headers.values("set-cookie");
    }

    // Somehow this is causing @defer not to work
    // if !response.headers.values("server-timing").is_empty() {
    //   response.context.server_timing_headers = response.headers.values("server-timing");
    // }
  };

  let store_server_timing_from_subgraphs = |response| {
    if !response.headers.values("server-timing").is_empty() {
      response.context.server_timing_headers = response.headers.values("server-timing");
    }
  };

  service.map_response(store_cookies_from_subgraphs);
}