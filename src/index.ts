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
      if ( this instanceof HTMLElement ) return method.call(this, arguments)
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