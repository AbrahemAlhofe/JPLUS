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
  }

  return window.getComputedStyle(this, pesoudElt).getPropertyValue(property);
})