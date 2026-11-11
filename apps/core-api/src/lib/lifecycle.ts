/** Set once the server is shutting down: `/ready` fails so load balancers stop sending traffic. */
let draining = false;

export const isDraining = () => draining;

export const startDraining = () => {
  draining = true;
};
