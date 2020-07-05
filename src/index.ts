// Interfaces

const globalAll: any = global

interface Object {
  [key: string] : any
}
/*

  jplus ()
    static add( methodName: string, method: Function ); void

*/
globalAll.jplus = class jplus {
  static add(methodName: string, method: Function): void {
    // Inject method into HTMLElement
    Object.prototype[methodName] = function () {
      // if Object is not HTMLELement throw an TypeError
      if ( this instanceof HTMLElement ) return method.call(this, ...arguments)
      else throw new TypeError(`You couldn't use ${methodName} with non HTMLElement`)
    }

    // Make method enumerable
    Object.defineProperty(Object.prototype, methodName, { enumerable: false });
  }
}

exports.jplus = globalAll.jplus;

/*

  $(query: string): ELement | Element[]
    for searching in document by query alternative to document.querySelector/All()

*/

globalAll.$ = function $(query: string): Element | Element[] {
  // IF : query is HTML element stracture
  if (query.trim()[0] === "<") {
    const div = document.createElement("div");
    div.innerHTML = query;
    return div.children[0];
  }

  // search in document by query
  const result: NodeListOf<any> = document.querySelectorAll(query);

  // IF : result is multiable of elements return it, else return one element
  return result.length === 1 ? result[0] : result;
};

exports.$ = globalAll.$

/*

  getAttr(attributes: string | string[])

  Setuations :
    <div class="box" data-number="123" ></div>

    getAttr() => { class : 'box', data-number : 123 }

    getAttr('class') => 'box'

    getAttr('data-number') => 123

    getAttr(['class', 'data-number']) => { class : 'box', data-number : 123 }

*/

globalAll.jplus.add("getAttr", function (
  this: HTMLElement,
  qualifiedName: string | string[]
): null | string | number | { [key: string]: any } {
  const attributes: { [key: string]: any } = {};

  function evaluate (string: string) {
    try {
      return JSON.parse(string)
    } catch (err) {
      return string
    }
  }

  if ( typeof qualifiedName == "string" ) return evaluate( String( this.getAttribute(qualifiedName) ) );

  if ( Array.isArray( qualifiedName ) ) qualifiedName.forEach(arg => {
    attributes[arg] = evaluate(String(this.getAttribute(arg)));
  })

  for ( let attribute of Array.from( this.attributes ) ) attributes[ attribute.name ] = evaluate( attribute.value )

  return attributes;
});

/*
  css( property: string, pesoudElt: null )

    Behaviour :

      <div style='color: red'></div>

      css() => { color: "red" , ... }

      css('color') => 'red'

      css({ color: 'blue' }) => <div style='color: blue'></div>
*/

globalAll.jplus.add("css", function css (this: HTMLElement, property: string, pesoudElt=null) {
  if ( property === undefined ) return this.style

  if ( Array.isArray( property ) ) {
    const properties: { [key: string] : any } = {}
    property.forEach((property: string) => properties[property] = css.call(this, property))
    return properties
  }

  if ( typeof property === 'object' && !Array.isArray(property) ) {
    const properties: { [key: string] : any } = property
    
    for ( let property in properties )
      this.style.setProperty( property, properties[property] );
    
    return
  }

  return window.getComputedStyle(this, pesoudElt).getPropertyValue(property);
})

/*
  on(...events, callBack)

  Behaviour 
    
    on('click', () => console.log('click')) => when element was clicked log : click

    on( 'click', 'mousedown', () => console.log('click', 'mousedown') ) when element was clicked or mousedown log : click
*/
globalAll.jplus.add("on", function on(this: HTMLElement, ...args: any[]): void {
  const events = Array.from( args ).slice(0, args.length - 1)
  const callBack = args[ args.length - 1 ]

  if ( events.length !== 1 ) return events.forEach((event) => on.call(this, event, callBack))

  this.addEventListener(events[0], callBack);
})

/*
  wrapWith(wrapper: HTMLElement, isWithChildren: boolean)

  Behaviour 
    element : <span> <span></span> </span>
    wrapper : <div></div>  

    wrapWith(wrappper) => 
    <div>
      <span>
        <span></span>
      </span>
    </div>

    wrapWith(wrapper, false) =>
    <div>
      <span></span>
    </div>

    wrapWith() => TypeError JPLUS [ wrapWith ] : wrapper must be an HTMLElement
*/
globalAll.jplus.add("wrapWith", function wrapWith(this: HTMLElement, wrapper: HTMLElement, isWithChildren: boolean = true):HTMLElement {
  if ( !(wrapper instanceof HTMLElement) ) throw new TypeError(`JPLUS [ wrapWith ] : wrapper must be an HTMLElement`)

  wrapper.appendChild(this.cloneNode(isWithChildren));

  if ( this.parentElement ) {
    this.parentElement.insertBefore(wrapper, this);
    this.parentElement.removeChild(this)
  }

  return wrapper
})

/*

    unWrap()

    Behavior :
      <div><span></span></div>

      unWrap() => <span></span>
*/

globalAll.jplus.add('unWrap', function unWrap(this: HTMLElement): HTMLElement {
  const parentElement: HTMLElement | null= this.parentElement
  
  if ( parentElement === null ) throw new TypeError(`JPLUS [ unWrap ] : element has not parent`)

  parentElement.replaceWith(this);
  
  return parentElement
})