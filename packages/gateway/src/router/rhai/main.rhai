fn supergraph_service(service) {
  let add_cookies_to_response = |response| {
    if response.context["set_cookie_headers"] == () || response.context["set_cookie_headers"].is_empty() {
      return;
    }
    response.headers["set-cookie"] += response.context["set_cookie_headers"];
  };

  service.map_response(add_cookies_to_response);
}

fn subgraph_service(service, subgraph) {
  let store_cookies_from_subgraphs = |response| {
    if response.headers.values("set-cookie").is_empty() { 
      return; 
    }
    response.context.set_cookie_headers = response.headers.values("set-cookie");
  };

  service.map_response(store_cookies_from_subgraphs);
}