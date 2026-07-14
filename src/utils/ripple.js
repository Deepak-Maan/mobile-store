/**
 * Creates a material ripple click effect on an element.
 * The target element MUST have position: relative and overflow: hidden.
 * @param {MouseEvent} event 
 */
export function createRipple(event) {
  // Guard: need a valid event with a currentTarget DOM element
  if (!event || !event.currentTarget) return;

  const button = event.currentTarget;
  
  // Clean up any remaining ripple spans
  const existingRipples = button.getElementsByClassName("ripple-effect");
  while (existingRipples.length > 0) {
    existingRipples[0].remove();
  }

  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  const rect = button.getBoundingClientRect();

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${(event.clientX || rect.left + radius) - rect.left - radius}px`;
  circle.style.top = `${(event.clientY || rect.top + radius) - rect.top - radius}px`;
  circle.classList.add("ripple-effect");

  button.appendChild(circle);

  // Remove ripple span after animation runs
  setTimeout(() => {
    circle.remove();
  }, 600);
}
