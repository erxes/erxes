fn supergraph_service(service) {
  let add_cookies_to_response = |response| {
    if response.is_primary() && response.context["set_cookie_headers"]?.len > 0 {
      response.headers["set-cookie"] = response.context["set_cookie_headers"];
    }
  };

  let add_server_timing_to_response = |response| {
    if response.is_primary() && response.context["server_timing_headers"]?.len > 0 {
      response.headers["server-timing"] = response.context["server_timing_headers"];
    }
  };

  service.map_response(add_cookies_to_response);
  service.map_response(add_server_timing_to_response);
}

fn subgraph_service(service, subgraph) {
  let store_cookies_from_subgraphs = |response| {
    if "set-cookie" in response.headers {
      if response.context["set_cookie_headers"] == () {
        response.context.set_cookie_headers = []
      }
      response.context.set_cookie_headers += response.headers.values("set-cookie");
    }
  };

  let store_server_timing_from_subgraphs = |response| {
    if "server-timing" in response.headers {
      if response.context["server_timing_headers"] == () {
        response.context.server_timing_headers = []
      }
      response.context.server_timing_headers += response.headers.values("server-timing");
    }
  };

  service.map_response(store_cookies_from_subgraphs);
  service.map_response(store_server_timing_from_subgraphs);
}