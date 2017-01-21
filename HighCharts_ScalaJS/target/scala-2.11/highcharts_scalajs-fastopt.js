(function(){
'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */





// Get the environment info
var $env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
var $g =
  (typeof $env["global"] === "object" && $env["global"])
    ? $env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
$env["global"] = $g;

// Where to send exports



var $e =
  (typeof $env["exportsNamespace"] === "object" && $env["exportsNamespace"])
    ? $env["exportsNamespace"] : $g;

$env["exportsNamespace"] = $e;

// Freeze the environment info
$g["Object"]["freeze"]($env);

// Linking info - must be in sync with scala.scalajs.runtime.LinkingInfo
var $linkingInfo = {
  "envInfo": $env,
  "semantics": {




    "asInstanceOfs": 1,










    "moduleInit": 2,





    "strictFloats": false,




    "productionMode": false

  },



  "assumingES6": false,

  "linkerVersion": "0.6.14"
};
$g["Object"]["freeze"]($linkingInfo);
$g["Object"]["freeze"]($linkingInfo["semantics"]);

// Snapshots of builtins and polyfills






var $imul = $g["Math"]["imul"] || (function(a, b) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

var $fround = $g["Math"]["fround"] ||









  (function(v) {
    return +v;
  });


var $clz32 = $g["Math"]["clz32"] || (function(i) {
  // See Hacker's Delight, Section 5-3
  if (i === 0) return 32;
  var r = 1;
  if ((i & 0xffff0000) === 0) { i <<= 16; r += 16; };
  if ((i & 0xff000000) === 0) { i <<= 8; r += 8; };
  if ((i & 0xf0000000) === 0) { i <<= 4; r += 4; };
  if ((i & 0xc0000000) === 0) { i <<= 2; r += 2; };
  return r + (i >> 31);
});


// Other fields

















var $lastIDHash = 0; // last value attributed to an id hash code



var $idHashCodeMap = $g["WeakMap"] ? new $g["WeakMap"]() : null;



// Core mechanism

var $makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};


var $makeAsArrayOfPrimitive = function(isInstanceOfFunction, arrayEncodedName) {
  return function(obj, depth) {
    if (isInstanceOfFunction(obj, depth) || (obj === null))
      return obj;
    else
      $throwArrayCastException(obj, arrayEncodedName, depth);
  }
};


/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
var $propertyName = function(obj) {
  for (var prop in obj)
    return prop;
};

// Runtime functions

var $isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};


var $throwClassCastException = function(instance, classFullName) {




  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ClassCastException().init___T(
      instance + " is not an instance of " + classFullName));

};

var $throwArrayCastException = function(instance, classArrayEncodedName, depth) {
  for (; depth; --depth)
    classArrayEncodedName = "[" + classArrayEncodedName;
  $throwClassCastException(instance, classArrayEncodedName);
};


var $noIsInstance = function(instance) {
  throw new $g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

var $makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

var $newArrayObject = function(arrayClassData, lengths) {
  return $newArrayObjectInternal(arrayClassData, lengths, 0);
};

var $newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  var result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    var subArrayClassData = arrayClassData.componentData;
    var subLengthIndex = lengthIndex+1;
    var underlying = result.u;
    for (var i = 0; i < underlying.length; i++) {
      underlying[i] = $newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

var $objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

var $objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return $d_T.getClassOf();
    case "number": {
      var v = instance | 0;
      if (v === instance) { // is the value integral?
        if ($isByte(v))
          return $d_jl_Byte.getClassOf();
        else if ($isShort(v))
          return $d_jl_Short.getClassOf();
        else
          return $d_jl_Integer.getClassOf();
      } else {
        if ($isFloat(instance))
          return $d_jl_Float.getClassOf();
        else
          return $d_jl_Double.getClassOf();
      }
    }
    case "boolean":
      return $d_jl_Boolean.getClassOf();
    case "undefined":
      return $d_sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        return instance.getClass__jl_Class();
      else if ($is_sjsr_RuntimeLong(instance))
        return $d_jl_Long.getClassOf();
      else if ($isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

var $objectClone = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new $c_jl_CloneNotSupportedException().init___();
};

var $objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

var $objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

var $objectFinalize = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

var $objectEquals = function(instance, rhs) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && $numberEquals(instance, rhs);
  else
    return instance === rhs;
};

var $numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

var $objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return $m_sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return $m_sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if ($isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();

      else if ($idHashCodeMap === null)
        return 42;

      else
        return $systemIdentityHashCode(instance);
  }
};

var $comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":

      $as_T(rhs);

      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":

      $as_jl_Number(rhs);

      return $m_jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":

      $asBoolean(rhs);

      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

var $charSequenceLength = function(instance) {
  if (typeof(instance) === "string")

    return $uI(instance["length"]);



  else
    return instance.length__I();
};

var $charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")

    return $uI(instance["charCodeAt"](index)) & 0xffff;



  else
    return instance.charAt__I__C(index);
};

var $charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")

    return $as_T(instance["substring"](start, end));



  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

var $booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

var $numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
var $numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
var $numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
var $numberLongValue = function(instance) {
  if (typeof instance === "number")
    return $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
var $numberFloatValue = function(instance) {
  if (typeof instance === "number") return $fround(instance);
  else                              return instance.floatValue__F();
};
var $numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

var $isNaN = function(instance) {
  return instance !== instance;
};

var $isInfinite = function(instance) {
  return !$g["isFinite"](instance) && !$isNaN(instance);
};

var $doubleToInt = function(x) {
  return (x > 2147483647) ? (2147483647) : ((x < -2147483648) ? -2147483648 : (x | 0));
};

/** Instantiates a JS object with variadic arguments to the constructor. */
var $newJSObjectWithVarargs = function(ctor, args) {
  // This basically emulates the ECMAScript specification for 'new'.
  var instance = $g["Object"]["create"](ctor.prototype);
  var result = ctor["apply"](instance, args);
  switch (typeof result) {
    case "string": case "number": case "boolean": case "undefined": case "symbol":
      return instance;
    default:
      return result === null ? instance : result;
  }
};

var $resolveSuperRef = function(initialProto, propName) {
  var getPrototypeOf = $g["Object"]["getPrototypeOf"];
  var getOwnPropertyDescriptor = $g["Object"]["getOwnPropertyDescriptor"];

  var superProto = getPrototypeOf(initialProto);
  while (superProto !== null) {
    var desc = getOwnPropertyDescriptor(superProto, propName);
    if (desc !== void 0)
      return desc;
    superProto = getPrototypeOf(superProto);
  }

  return void 0;
};

var $superGet = function(initialProto, self, propName) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var getter = desc["get"];
    if (getter !== void 0)
      return getter["call"](self);
    else
      return desc["value"];
  }
  return void 0;
};

var $superSet = function(initialProto, self, propName, value) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var setter = desc["set"];
    if (setter !== void 0) {
      setter["call"](self, value);
      return void 0;
    }
  }
  throw new $g["TypeError"]("super has no setter '" + propName + "'.");
};







var $propertiesOf = function(obj) {
  var result = [];
  for (var prop in obj)
    result["push"](prop);
  return result;
};

var $systemArraycopy = function(src, srcPos, dest, destPos, length) {
  var srcu = src.u;
  var destu = dest.u;
  if (srcu !== destu || destPos < srcPos || srcPos + length < destPos) {
    for (var i = 0; i < length; i++)
      destu[destPos+i] = srcu[srcPos+i];
  } else {
    for (var i = length-1; i >= 0; i--)
      destu[destPos+i] = srcu[srcPos+i];
  }
};

var $systemIdentityHashCode =

  ($idHashCodeMap !== null) ?

  (function(obj) {
    switch (typeof obj) {
      case "string": case "number": case "boolean": case "undefined":
        return $objectHashCode(obj);
      default:
        if (obj === null) {
          return 0;
        } else {
          var hash = $idHashCodeMap["get"](obj);
          if (hash === void 0) {
            hash = ($lastIDHash + 1) | 0;
            $lastIDHash = hash;
            $idHashCodeMap["set"](obj, hash);
          }
          return hash;
        }
    }

  }) :
  (function(obj) {
    if ($isScalaJSObject(obj)) {
      var hash = obj["$idHashCode$0"];
      if (hash !== void 0) {
        return hash;
      } else if (!$g["Object"]["isSealed"](obj)) {
        hash = ($lastIDHash + 1) | 0;
        $lastIDHash = hash;
        obj["$idHashCode$0"] = hash;
        return hash;
      } else {
        return 42;
      }
    } else if (obj === null) {
      return 0;
    } else {
      return $objectHashCode(obj);
    }

  });

// is/as for hijacked boxed classes (the non-trivial ones)

var $isByte = function(v) {
  return (v << 24 >> 24) === v && 1/v !== 1/-0;
};

var $isShort = function(v) {
  return (v << 16 >> 16) === v && 1/v !== 1/-0;
};

var $isInt = function(v) {
  return (v | 0) === v && 1/v !== 1/-0;
};

var $isFloat = function(v) {



  return typeof v === "number";

};


var $asUnit = function(v) {
  if (v === void 0 || v === null)
    return v;
  else
    $throwClassCastException(v, "scala.runtime.BoxedUnit");
};

var $asBoolean = function(v) {
  if (typeof v === "boolean" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Boolean");
};

var $asByte = function(v) {
  if ($isByte(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Byte");
};

var $asShort = function(v) {
  if ($isShort(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Short");
};

var $asInt = function(v) {
  if ($isInt(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Integer");
};

var $asFloat = function(v) {
  if ($isFloat(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Float");
};

var $asDouble = function(v) {
  if (typeof v === "number" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Double");
};


// Unboxes


var $uZ = function(value) {
  return !!$asBoolean(value);
};
var $uB = function(value) {
  return $asByte(value) | 0;
};
var $uS = function(value) {
  return $asShort(value) | 0;
};
var $uI = function(value) {
  return $asInt(value) | 0;
};
var $uJ = function(value) {
  return null === value ? $m_sjsr_RuntimeLong$().Zero$1
                        : $as_sjsr_RuntimeLong(value);
};
var $uF = function(value) {
  /* Here, it is fine to use + instead of fround, because asFloat already
   * ensures that the result is either null or a float.
   */
  return +$asFloat(value);
};
var $uD = function(value) {
  return +$asDouble(value);
};






// TypeArray conversions

var $byteArray2TypedArray = function(value) { return new $g["Int8Array"](value.u); };
var $shortArray2TypedArray = function(value) { return new $g["Int16Array"](value.u); };
var $charArray2TypedArray = function(value) { return new $g["Uint16Array"](value.u); };
var $intArray2TypedArray = function(value) { return new $g["Int32Array"](value.u); };
var $floatArray2TypedArray = function(value) { return new $g["Float32Array"](value.u); };
var $doubleArray2TypedArray = function(value) { return new $g["Float64Array"](value.u); };

var $typedArray2ByteArray = function(value) {
  var arrayClassData = $d_B.getArrayOf();
  return new arrayClassData.constr(new $g["Int8Array"](value));
};
var $typedArray2ShortArray = function(value) {
  var arrayClassData = $d_S.getArrayOf();
  return new arrayClassData.constr(new $g["Int16Array"](value));
};
var $typedArray2CharArray = function(value) {
  var arrayClassData = $d_C.getArrayOf();
  return new arrayClassData.constr(new $g["Uint16Array"](value));
};
var $typedArray2IntArray = function(value) {
  var arrayClassData = $d_I.getArrayOf();
  return new arrayClassData.constr(new $g["Int32Array"](value));
};
var $typedArray2FloatArray = function(value) {
  var arrayClassData = $d_F.getArrayOf();
  return new arrayClassData.constr(new $g["Float32Array"](value));
};
var $typedArray2DoubleArray = function(value) {
  var arrayClassData = $d_D.getArrayOf();
  return new arrayClassData.constr(new $g["Float64Array"](value));
};

/* We have to force a non-elidable *read* of $e, otherwise Closure will
 * eliminate it altogether, along with all the exports, which is ... er ...
 * plain wrong.
 */
this["__ScalaJSExportsNamespace"] = $e;

// TypeData class


/** @constructor */
var $TypeData = function() {




  // Runtime support
  this.constr = void 0;
  this.parentData = void 0;
  this.ancestors = null;
  this.componentData = null;
  this.arrayBase = null;
  this.arrayDepth = 0;
  this.zero = null;
  this.arrayEncodedName = "";
  this._classOf = void 0;
  this._arrayOf = void 0;
  this.isArrayOf = void 0;

  // java.lang.Class support
  this["name"] = "";
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isRawJSType"] = false;
  this["isInstance"] = void 0;
};


$TypeData.prototype.initPrim = function(



    zero, arrayEncodedName, displayName) {
  // Runtime support
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInstance"] = function(obj) { return false; };

  return this;
};


$TypeData.prototype.initClass = function(



    internalNameObj, isInterface, fullName,
    ancestors, isRawJSType, parentData, isInstance, isArrayOf) {
  var internalName = $propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.arrayEncodedName = "L"+fullName+";";
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isInterface"] = isInterface;
  this["isRawJSType"] = !!isRawJSType;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.initArray = function(



    componentData) {
  // The constructor

  var componentZero0 = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  var componentZero = (componentZero0 == "longZero")
    ? $m_sjsr_RuntimeLong$().Zero$1
    : componentZero0;


  /** @constructor */
  var ArrayClass = function(arg) {
    if (typeof(arg) === "number") {
      // arg is the length of the array
      this.u = new Array(arg);
      for (var i = 0; i < arg; i++)
        this.u[i] = componentZero;
    } else {
      // arg is a native array that we wrap
      this.u = arg;
    }
  }
  ArrayClass.prototype = new $h_O;
  ArrayClass.prototype.constructor = ArrayClass;

  ArrayClass.prototype.clone__O = function() {
    if (this.u instanceof Array)
      return new ArrayClass(this.u["slice"](0));
    else
      // The underlying Array is a TypedArray
      return new ArrayClass(new this.u.constructor(this.u));
  };

























  ArrayClass.prototype.$classData = this;

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  var encodedName = "[" + componentData.arrayEncodedName;
  var componentBase = componentData.arrayBase || componentData;
  var arrayDepth = componentData.arrayDepth + 1;

  var isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = $d_O;
  this.ancestors = {O: 1, jl_Cloneable: 1, Ljava_io_Serializable: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.getClassOf = function() {



  if (!this._classOf)
    this._classOf = new $c_jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};


$TypeData.prototype.getArrayOf = function() {



  if (!this._arrayOf)
    this._arrayOf = new $TypeData().initArray(this);
  return this._arrayOf;
};

// java.lang.Class support


$TypeData.prototype["getFakeInstance"] = function() {



  if (this === $d_T)
    return "some string";
  else if (this === $d_jl_Boolean)
    return false;
  else if (this === $d_jl_Byte ||
           this === $d_jl_Short ||
           this === $d_jl_Integer ||
           this === $d_jl_Float ||
           this === $d_jl_Double)
    return 0;
  else if (this === $d_jl_Long)
    return $m_sjsr_RuntimeLong$().Zero$1;
  else if (this === $d_sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};


$TypeData.prototype["getSuperclass"] = function() {



  return this.parentData ? this.parentData.getClassOf() : null;
};


$TypeData.prototype["getComponentType"] = function() {



  return this.componentData ? this.componentData.getClassOf() : null;
};


$TypeData.prototype["newArrayOfThisClass"] = function(lengths) {



  var arrayClassData = this;
  for (var i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return $newArrayObject(arrayClassData, lengths);
};




// Create primitive types

var $d_V = new $TypeData().initPrim(undefined, "V", "void");
var $d_Z = new $TypeData().initPrim(false, "Z", "boolean");
var $d_C = new $TypeData().initPrim(0, "C", "char");
var $d_B = new $TypeData().initPrim(0, "B", "byte");
var $d_S = new $TypeData().initPrim(0, "S", "short");
var $d_I = new $TypeData().initPrim(0, "I", "int");
var $d_J = new $TypeData().initPrim("longZero", "J", "long");
var $d_F = new $TypeData().initPrim(0.0, "F", "float");
var $d_D = new $TypeData().initPrim(0.0, "D", "double");

// Instance tests for array of primitives

var $isArrayOf_Z = $makeIsArrayOfPrimitive($d_Z);
$d_Z.isArrayOf = $isArrayOf_Z;

var $isArrayOf_C = $makeIsArrayOfPrimitive($d_C);
$d_C.isArrayOf = $isArrayOf_C;

var $isArrayOf_B = $makeIsArrayOfPrimitive($d_B);
$d_B.isArrayOf = $isArrayOf_B;

var $isArrayOf_S = $makeIsArrayOfPrimitive($d_S);
$d_S.isArrayOf = $isArrayOf_S;

var $isArrayOf_I = $makeIsArrayOfPrimitive($d_I);
$d_I.isArrayOf = $isArrayOf_I;

var $isArrayOf_J = $makeIsArrayOfPrimitive($d_J);
$d_J.isArrayOf = $isArrayOf_J;

var $isArrayOf_F = $makeIsArrayOfPrimitive($d_F);
$d_F.isArrayOf = $isArrayOf_F;

var $isArrayOf_D = $makeIsArrayOfPrimitive($d_D);
$d_D.isArrayOf = $isArrayOf_D;


// asInstanceOfs for array of primitives
var $asArrayOf_Z = $makeAsArrayOfPrimitive($isArrayOf_Z, "Z");
var $asArrayOf_C = $makeAsArrayOfPrimitive($isArrayOf_C, "C");
var $asArrayOf_B = $makeAsArrayOfPrimitive($isArrayOf_B, "B");
var $asArrayOf_S = $makeAsArrayOfPrimitive($isArrayOf_S, "S");
var $asArrayOf_I = $makeAsArrayOfPrimitive($isArrayOf_I, "I");
var $asArrayOf_J = $makeAsArrayOfPrimitive($isArrayOf_J, "J");
var $asArrayOf_F = $makeAsArrayOfPrimitive($isArrayOf_F, "F");
var $asArrayOf_D = $makeAsArrayOfPrimitive($isArrayOf_D, "D");

/** @constructor */
function $c_O() {
  /*<skip>*/
}
/** @constructor */
function $h_O() {
  /*<skip>*/
}
$h_O.prototype = $c_O.prototype;
$c_O.prototype.init___ = (function() {
  return this
});
$c_O.prototype.toString__T = (function() {
  var jsx$2 = $objectGetClass(this).getName__T();
  var i = this.hashCode__I();
  var x = $uD((i >>> 0));
  var jsx$1 = x.toString(16);
  return ((jsx$2 + "@") + $as_T(jsx$1))
});
$c_O.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
$c_O.prototype.toString = (function() {
  return this.toString__T()
});
function $is_O(obj) {
  return (obj !== null)
}
function $as_O(obj) {
  return obj
}
function $isArrayOf_O(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    var arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase.isPrimitive)))
  }
}
function $asArrayOf_O(obj, depth) {
  return (($isArrayOf_O(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Object;", depth))
}
var $d_O = new $TypeData().initClass({
  O: 0
}, false, "java.lang.Object", {
  O: 1
}, (void 0), (void 0), $is_O, $isArrayOf_O);
$c_O.prototype.$classData = $d_O;
function $s_s_Product2$class__productElement__s_Product2__I__O($$this, n) {
  switch (n) {
    case 0: {
      return $$this.$$und1$f;
      break
    }
    case 1: {
      return $$this.$$und2$f;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
    }
  }
}
function $s_Lcom_highcharts_AnySeriesDef$class__anySeriesArrayConvert__Lcom_highcharts_AnySeriesDef__sjs_js_Array__sjs_js_UndefOr($$this, arr) {
  var array = [];
  $uI(arr.length);
  var i = 0;
  var len = $uI(arr.length);
  while ((i < len)) {
    var index = i;
    var arg1 = arr[index];
    var elem = $m_Lcom_highcharts_CleanJsObject$().apply__sjs_js_Object__sjs_js_Object(arg1);
    array.push(elem);
    i = ((1 + i) | 0)
  };
  return array
}
/** @constructor */
function $c_Lcom_highcharts_CleanJsObject$() {
  $c_O.call(this)
}
$c_Lcom_highcharts_CleanJsObject$.prototype = new $h_O();
$c_Lcom_highcharts_CleanJsObject$.prototype.constructor = $c_Lcom_highcharts_CleanJsObject$;
/** @constructor */
function $h_Lcom_highcharts_CleanJsObject$() {
  /*<skip>*/
}
$h_Lcom_highcharts_CleanJsObject$.prototype = $c_Lcom_highcharts_CleanJsObject$.prototype;
$c_Lcom_highcharts_CleanJsObject$.prototype.init___ = (function() {
  return this
});
$c_Lcom_highcharts_CleanJsObject$.prototype.com$highcharts$CleanJsObject$$cleanProperty$1__sjs_js_Any__sjs_js_Any = (function(p) {
  if ($uZ($g.Array.isArray(p))) {
    var array = [];
    var i = 0;
    var len = $uI(p.length);
    while ((i < len)) {
      var index = i;
      var arg1 = p[index];
      if (((arg1 === (void 0)) !== true)) {
        array.push(arg1)
      };
      i = ((1 + i) | 0)
    };
    var array$1 = [];
    $uI(array.length);
    var i$1 = 0;
    var len$1 = $uI(array.length);
    while ((i$1 < len$1)) {
      var index$1 = i$1;
      var arg1$1 = array[index$1];
      var elem = $m_Lcom_highcharts_CleanJsObject$().com$highcharts$CleanJsObject$$cleanProperty$1__sjs_js_Any__sjs_js_Any(arg1$1);
      array$1.push(elem);
      i$1 = ((1 + i$1) | 0)
    };
    return array$1
  } else {
    return p
  }
});
$c_Lcom_highcharts_CleanJsObject$.prototype.apply__sjs_js_Object__sjs_js_Object = (function(v) {
  if ((v === null)) {
    return null
  } else if ((v === (void 0))) {
    return (void 0)
  } else {
    var newObj = {};
    var array = $g.Object.keys(v);
    var array$1 = [];
    var i = 0;
    var len = $uI(array.length);
    while ((i < len)) {
      var index = i;
      var arg1 = array[index];
      var key = $as_T(arg1);
      var v$1 = v[key];
      if (((v$1 === (void 0)) !== true)) {
        array$1.push(arg1)
      };
      i = ((1 + i) | 0)
    };
    var array$2 = [];
    $uI(array$1.length);
    var i$1 = 0;
    var len$1 = $uI(array$1.length);
    while ((i$1 < len$1)) {
      var index$1 = i$1;
      var arg1$1 = array$1[index$1];
      var key$1 = $as_T(arg1$1);
      var y = $m_Lcom_highcharts_CleanJsObject$().com$highcharts$CleanJsObject$$cleanProperty$1__sjs_js_Any__sjs_js_Any(v[key$1]);
      var elem = new $c_T2().init___O__O(key$1, y);
      array$2.push(elem);
      i$1 = ((1 + i$1) | 0)
    };
    var i$2 = 0;
    var len$2 = $uI(array$2.length);
    while ((i$2 < len$2)) {
      var index$2 = i$2;
      var arg1$2 = array$2[index$2];
      var x0$1 = $as_T2(arg1$2);
      if ((x0$1 !== null)) {
        var key$2 = $as_T(x0$1.$$und1$f);
        var value = x0$1.$$und2$f;
        newObj[key$2] = value
      } else {
        throw new $c_s_MatchError().init___O(x0$1)
      };
      i$2 = ((1 + i$2) | 0)
    };
    return newObj
  }
});
var $d_Lcom_highcharts_CleanJsObject$ = new $TypeData().initClass({
  Lcom_highcharts_CleanJsObject$: 0
}, false, "com.highcharts.CleanJsObject$", {
  Lcom_highcharts_CleanJsObject$: 1,
  O: 1
});
$c_Lcom_highcharts_CleanJsObject$.prototype.$classData = $d_Lcom_highcharts_CleanJsObject$;
var $n_Lcom_highcharts_CleanJsObject$ = (void 0);
function $m_Lcom_highcharts_CleanJsObject$() {
  if ((!$n_Lcom_highcharts_CleanJsObject$)) {
    $n_Lcom_highcharts_CleanJsObject$ = new $c_Lcom_highcharts_CleanJsObject$().init___()
  };
  return $n_Lcom_highcharts_CleanJsObject$
}
function $s_Lcom_highcharts_HighchartsImplicits$class__highchartsCfg__Lcom_highcharts_HighchartsImplicits__sjs_js_Object__sjs_js_UndefOr($$this, obj) {
  var value = $m_Lcom_highcharts_CleanJsObject$().apply__sjs_js_Object__sjs_js_Object(obj);
  return value
}
/** @constructor */
function $c_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$() {
  $c_O.call(this)
}
$c_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$.prototype = new $h_O();
$c_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$.prototype.constructor = $c_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$;
/** @constructor */
function $h_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$() {
  /*<skip>*/
}
$h_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$.prototype = $c_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$.prototype;
$c_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$.prototype.init___ = (function() {
  return this
});
$c_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$.prototype.highcharts$extension1__Lorg_scalajs_jquery_JQuery__Lcom_highcharts_CleanJsObject__Lorg_scalajs_jquery_JQuery = (function($$this, config) {
  return $$this.highcharts(config)
});
var $d_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$ = new $TypeData().initClass({
  Lcom_highcharts_HighchartsUtils$HighchartsJQuery$: 0
}, false, "com.highcharts.HighchartsUtils$HighchartsJQuery$", {
  Lcom_highcharts_HighchartsUtils$HighchartsJQuery$: 1,
  O: 1
});
$c_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$.prototype.$classData = $d_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$;
var $n_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$ = (void 0);
function $m_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$() {
  if ((!$n_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$)) {
    $n_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$ = new $c_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$().init___()
  };
  return $n_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$
}
/** @constructor */
function $c_Lcom_highcharts_config_Chart$() {
  $c_O.call(this)
}
$c_Lcom_highcharts_config_Chart$.prototype = new $h_O();
$c_Lcom_highcharts_config_Chart$.prototype.constructor = $c_Lcom_highcharts_config_Chart$;
/** @constructor */
function $h_Lcom_highcharts_config_Chart$() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_Chart$.prototype = $c_Lcom_highcharts_config_Chart$.prototype;
$c_Lcom_highcharts_config_Chart$.prototype.init___ = (function() {
  return this
});
$c_Lcom_highcharts_config_Chart$.prototype.apply__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__Lcom_highcharts_config_Chart = (function(alignTicks, animation, backgroundColor, borderColor, borderRadius, borderWidth, className, defaultSeriesType, events, height, ignoreHiddenSeries, inverted, margin, marginBottom, marginLeft, marginRight, marginTop, options3d, panKey, panning, pinchType, plotBackgroundColor, plotBackgroundImage, plotBorderColor, plotBorderWidth, plotShadow, polar, reflow, renderTo, resetZoomButton, selectionMarkerFill, shadow, showAxes, spacing, spacingBottom, spacingLeft, spacingRight, spacingTop, style, type, width, zoomType) {
  return new $c_Lcom_highcharts_config_Chart$$anon$1(alignTicks, animation, backgroundColor, borderColor, borderRadius, borderWidth, className, defaultSeriesType, events, height, ignoreHiddenSeries, inverted, margin, marginBottom, marginLeft, marginRight, marginTop, options3d, panKey, panning, pinchType, plotBackgroundColor, plotBackgroundImage, plotBorderColor, plotBorderWidth, plotShadow, polar, reflow, renderTo, resetZoomButton, selectionMarkerFill, shadow, showAxes, spacing, spacingBottom, spacingLeft, spacingRight, spacingTop, style, type, width, zoomType)
});
var $d_Lcom_highcharts_config_Chart$ = new $TypeData().initClass({
  Lcom_highcharts_config_Chart$: 0
}, false, "com.highcharts.config.Chart$", {
  Lcom_highcharts_config_Chart$: 1,
  O: 1
});
$c_Lcom_highcharts_config_Chart$.prototype.$classData = $d_Lcom_highcharts_config_Chart$;
var $n_Lcom_highcharts_config_Chart$ = (void 0);
function $m_Lcom_highcharts_config_Chart$() {
  if ((!$n_Lcom_highcharts_config_Chart$)) {
    $n_Lcom_highcharts_config_Chart$ = new $c_Lcom_highcharts_config_Chart$().init___()
  };
  return $n_Lcom_highcharts_config_Chart$
}
/** @constructor */
function $c_Lcom_highcharts_config_SeriesLine$() {
  $c_O.call(this)
}
$c_Lcom_highcharts_config_SeriesLine$.prototype = new $h_O();
$c_Lcom_highcharts_config_SeriesLine$.prototype.constructor = $c_Lcom_highcharts_config_SeriesLine$;
/** @constructor */
function $h_Lcom_highcharts_config_SeriesLine$() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_SeriesLine$.prototype = $c_Lcom_highcharts_config_SeriesLine$.prototype;
$c_Lcom_highcharts_config_SeriesLine$.prototype.init___ = (function() {
  return this
});
$c_Lcom_highcharts_config_SeriesLine$.prototype.apply__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__T__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__Lcom_highcharts_config_SeriesLine = (function(allowPointSelect, animation, color, connectEnds, connectNulls, cropThreshold, cursor, dashStyle, data, dataLabels, enableMouseTracking, events, getExtremesFromAll, id, index, keys, legendIndex, lineWidth, linecap, linkedTo, marker, name, negativeColor, point, pointInterval, pointIntervalUnit, pointPlacement, pointStart, selected, shadow, showCheckbox, showInLegend, softThreshold, stack, stacking, states, step, stickyTracking, threshold, tooltip, turboThreshold, type, visible, xAxis, yAxis, zIndex, zoneAxis, zones) {
  return new $c_Lcom_highcharts_config_SeriesLine$$anon$1(allowPointSelect, animation, color, connectEnds, connectNulls, cropThreshold, cursor, dashStyle, data, dataLabels, enableMouseTracking, events, getExtremesFromAll, id, index, keys, legendIndex, lineWidth, linecap, linkedTo, marker, name, negativeColor, point, pointInterval, pointIntervalUnit, pointPlacement, pointStart, selected, shadow, showCheckbox, showInLegend, softThreshold, stack, stacking, states, step, stickyTracking, threshold, tooltip, turboThreshold, type, visible, xAxis, yAxis, zIndex, zoneAxis, zones)
});
var $d_Lcom_highcharts_config_SeriesLine$ = new $TypeData().initClass({
  Lcom_highcharts_config_SeriesLine$: 0
}, false, "com.highcharts.config.SeriesLine$", {
  Lcom_highcharts_config_SeriesLine$: 1,
  O: 1
});
$c_Lcom_highcharts_config_SeriesLine$.prototype.$classData = $d_Lcom_highcharts_config_SeriesLine$;
var $n_Lcom_highcharts_config_SeriesLine$ = (void 0);
function $m_Lcom_highcharts_config_SeriesLine$() {
  if ((!$n_Lcom_highcharts_config_SeriesLine$)) {
    $n_Lcom_highcharts_config_SeriesLine$ = new $c_Lcom_highcharts_config_SeriesLine$().init___()
  };
  return $n_Lcom_highcharts_config_SeriesLine$
}
/** @constructor */
function $c_Lcom_highcharts_config_Title$() {
  $c_O.call(this)
}
$c_Lcom_highcharts_config_Title$.prototype = new $h_O();
$c_Lcom_highcharts_config_Title$.prototype.constructor = $c_Lcom_highcharts_config_Title$;
/** @constructor */
function $h_Lcom_highcharts_config_Title$() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_Title$.prototype = $c_Lcom_highcharts_config_Title$.prototype;
$c_Lcom_highcharts_config_Title$.prototype.init___ = (function() {
  return this
});
$c_Lcom_highcharts_config_Title$.prototype.apply__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__Lcom_highcharts_config_Title = (function(align, floating, margin, style, text, useHTML, verticalAlign, x, y) {
  return new $c_Lcom_highcharts_config_Title$$anon$1(align, floating, margin, style, text, useHTML, verticalAlign, x, y)
});
var $d_Lcom_highcharts_config_Title$ = new $TypeData().initClass({
  Lcom_highcharts_config_Title$: 0
}, false, "com.highcharts.config.Title$", {
  Lcom_highcharts_config_Title$: 1,
  O: 1
});
$c_Lcom_highcharts_config_Title$.prototype.$classData = $d_Lcom_highcharts_config_Title$;
var $n_Lcom_highcharts_config_Title$ = (void 0);
function $m_Lcom_highcharts_config_Title$() {
  if ((!$n_Lcom_highcharts_config_Title$)) {
    $n_Lcom_highcharts_config_Title$ = new $c_Lcom_highcharts_config_Title$().init___()
  };
  return $n_Lcom_highcharts_config_Title$
}
/** @constructor */
function $c_Lcom_highcharts_config_YAxis$() {
  $c_O.call(this)
}
$c_Lcom_highcharts_config_YAxis$.prototype = new $h_O();
$c_Lcom_highcharts_config_YAxis$.prototype.constructor = $c_Lcom_highcharts_config_YAxis$;
/** @constructor */
function $h_Lcom_highcharts_config_YAxis$() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_YAxis$.prototype = $c_Lcom_highcharts_config_YAxis$.prototype;
$c_Lcom_highcharts_config_YAxis$.prototype.init___ = (function() {
  return this
});
$c_Lcom_highcharts_config_YAxis$.prototype.apply__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__Lcom_highcharts_config_YAxis = (function(allowDecimals, alternateGridColor, breaks, categories, ceiling, crosshair, dateTimeLabelFormats, endOnTick, events, floor, gridLineColor, gridLineDashStyle, gridLineInterpolation, gridLineWidth, gridZIndex, id, labels, lineColor, lineWidth, linkedTo, max, maxColor, maxPadding, maxZoom, min, minColor, minPadding, minRange, minTickInterval, minorGridLineColor, minorGridLineDashStyle, minorGridLineWidth, minorTickColor, minorTickInterval, minorTickLength, minorTickPosition, minorTickWidth, offset, opposite, plotBands, plotLines, reversed, reversedStacks, showEmpty, showFirstLabel, showLastLabel, stackLabels, startOfWeek, startOnTick, stops, tickAmount, tickColor, tickInterval, tickLength, tickPixelInterval, tickPosition, tickPositioner, tickPositions, tickWidth, tickmarkPlacement, title, type, units, visible) {
  return new $c_Lcom_highcharts_config_YAxis$$anon$1(allowDecimals, alternateGridColor, breaks, categories, ceiling, crosshair, dateTimeLabelFormats, endOnTick, events, floor, gridLineColor, gridLineDashStyle, gridLineInterpolation, gridLineWidth, gridZIndex, id, labels, lineColor, lineWidth, linkedTo, max, maxColor, maxPadding, maxZoom, min, minColor, minPadding, minRange, minTickInterval, minorGridLineColor, minorGridLineDashStyle, minorGridLineWidth, minorTickColor, minorTickInterval, minorTickLength, minorTickPosition, minorTickWidth, offset, opposite, plotBands, plotLines, reversed, reversedStacks, showEmpty, showFirstLabel, showLastLabel, stackLabels, startOfWeek, startOnTick, stops, tickAmount, tickColor, tickInterval, tickLength, tickPixelInterval, tickPosition, tickPositioner, tickPositions, tickWidth, tickmarkPlacement, title, type, units, visible)
});
var $d_Lcom_highcharts_config_YAxis$ = new $TypeData().initClass({
  Lcom_highcharts_config_YAxis$: 0
}, false, "com.highcharts.config.YAxis$", {
  Lcom_highcharts_config_YAxis$: 1,
  O: 1
});
$c_Lcom_highcharts_config_YAxis$.prototype.$classData = $d_Lcom_highcharts_config_YAxis$;
var $n_Lcom_highcharts_config_YAxis$ = (void 0);
function $m_Lcom_highcharts_config_YAxis$() {
  if ((!$n_Lcom_highcharts_config_YAxis$)) {
    $n_Lcom_highcharts_config_YAxis$ = new $c_Lcom_highcharts_config_YAxis$().init___()
  };
  return $n_Lcom_highcharts_config_YAxis$
}
/** @constructor */
function $c_Lcom_highcharts_config_YAxisTitle$() {
  $c_O.call(this)
}
$c_Lcom_highcharts_config_YAxisTitle$.prototype = new $h_O();
$c_Lcom_highcharts_config_YAxisTitle$.prototype.constructor = $c_Lcom_highcharts_config_YAxisTitle$;
/** @constructor */
function $h_Lcom_highcharts_config_YAxisTitle$() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_YAxisTitle$.prototype = $c_Lcom_highcharts_config_YAxisTitle$.prototype;
$c_Lcom_highcharts_config_YAxisTitle$.prototype.init___ = (function() {
  return this
});
$c_Lcom_highcharts_config_YAxisTitle$.prototype.apply__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__Lcom_highcharts_config_YAxisTitle = (function(align, enabled, margin, offset, rotation, style, text, x, y) {
  return new $c_Lcom_highcharts_config_YAxisTitle$$anon$1(align, enabled, margin, offset, rotation, style, text, x, y)
});
var $d_Lcom_highcharts_config_YAxisTitle$ = new $TypeData().initClass({
  Lcom_highcharts_config_YAxisTitle$: 0
}, false, "com.highcharts.config.YAxisTitle$", {
  Lcom_highcharts_config_YAxisTitle$: 1,
  O: 1
});
$c_Lcom_highcharts_config_YAxisTitle$.prototype.$classData = $d_Lcom_highcharts_config_YAxisTitle$;
var $n_Lcom_highcharts_config_YAxisTitle$ = (void 0);
function $m_Lcom_highcharts_config_YAxisTitle$() {
  if ((!$n_Lcom_highcharts_config_YAxisTitle$)) {
    $n_Lcom_highcharts_config_YAxisTitle$ = new $c_Lcom_highcharts_config_YAxisTitle$().init___()
  };
  return $n_Lcom_highcharts_config_YAxisTitle$
}
/** @constructor */
function $c_Lorg_scalajs_jquery_package$() {
  $c_O.call(this);
  this.jQuery$1 = null
}
$c_Lorg_scalajs_jquery_package$.prototype = new $h_O();
$c_Lorg_scalajs_jquery_package$.prototype.constructor = $c_Lorg_scalajs_jquery_package$;
/** @constructor */
function $h_Lorg_scalajs_jquery_package$() {
  /*<skip>*/
}
$h_Lorg_scalajs_jquery_package$.prototype = $c_Lorg_scalajs_jquery_package$.prototype;
$c_Lorg_scalajs_jquery_package$.prototype.init___ = (function() {
  $n_Lorg_scalajs_jquery_package$ = this;
  this.jQuery$1 = $g.jQuery;
  return this
});
var $d_Lorg_scalajs_jquery_package$ = new $TypeData().initClass({
  Lorg_scalajs_jquery_package$: 0
}, false, "org.scalajs.jquery.package$", {
  Lorg_scalajs_jquery_package$: 1,
  O: 1
});
$c_Lorg_scalajs_jquery_package$.prototype.$classData = $d_Lorg_scalajs_jquery_package$;
var $n_Lorg_scalajs_jquery_package$ = (void 0);
function $m_Lorg_scalajs_jquery_package$() {
  if ((!$n_Lorg_scalajs_jquery_package$)) {
    $n_Lorg_scalajs_jquery_package$ = new $c_Lorg_scalajs_jquery_package$().init___()
  };
  return $n_Lorg_scalajs_jquery_package$
}
/** @constructor */
function $c_jl_Class() {
  $c_O.call(this);
  this.data$1 = null
}
$c_jl_Class.prototype = new $h_O();
$c_jl_Class.prototype.constructor = $c_jl_Class;
/** @constructor */
function $h_jl_Class() {
  /*<skip>*/
}
$h_jl_Class.prototype = $c_jl_Class.prototype;
$c_jl_Class.prototype.getName__T = (function() {
  return $as_T(this.data$1.name)
});
$c_jl_Class.prototype.isPrimitive__Z = (function() {
  return $uZ(this.data$1.isPrimitive)
});
$c_jl_Class.prototype.toString__T = (function() {
  return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
});
$c_jl_Class.prototype.init___jl_ScalaJSClassData = (function(data) {
  this.data$1 = data;
  return this
});
$c_jl_Class.prototype.isInterface__Z = (function() {
  return $uZ(this.data$1.isInterface)
});
var $d_jl_Class = new $TypeData().initClass({
  jl_Class: 0
}, false, "java.lang.Class", {
  jl_Class: 1,
  O: 1
});
$c_jl_Class.prototype.$classData = $d_jl_Class;
/** @constructor */
function $c_s_util_hashing_MurmurHash3() {
  $c_O.call(this)
}
$c_s_util_hashing_MurmurHash3.prototype = new $h_O();
$c_s_util_hashing_MurmurHash3.prototype.constructor = $c_s_util_hashing_MurmurHash3;
/** @constructor */
function $h_s_util_hashing_MurmurHash3() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3.prototype = $c_s_util_hashing_MurmurHash3.prototype;
$c_s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = $imul((-862048943), k);
  var i = k;
  k = ((i << 15) | ((i >>> 17) | 0));
  k = $imul(461845907, k);
  return (hash ^ k)
});
$c_s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  var i = h;
  h = ((i << 13) | ((i >>> 19) | 0));
  return (((-430675100) + $imul(5, h)) | 0)
});
$c_s_util_hashing_MurmurHash3.prototype.avalanche__p1__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = $imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = $imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
$c_s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__I = (function(x, seed) {
  var arr = x.productArity__I();
  if ((arr === 0)) {
    var this$1 = x.productPrefix__T();
    return $m_sjsr_RuntimeString$().hashCode__T__I(this$1)
  } else {
    var h = seed;
    var i = 0;
    while ((i < arr)) {
      h = this.mix__I__I__I(h, $m_sr_ScalaRunTime$().hash__O__I(x.productElement__I__O(i)));
      i = ((1 + i) | 0)
    };
    return this.finalizeHash__I__I__I(h, arr)
  }
});
$c_s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__p1__I__I((hash ^ length))
});
/** @constructor */
function $c_sjs_js_package$() {
  $c_O.call(this)
}
$c_sjs_js_package$.prototype = new $h_O();
$c_sjs_js_package$.prototype.constructor = $c_sjs_js_package$;
/** @constructor */
function $h_sjs_js_package$() {
  /*<skip>*/
}
$h_sjs_js_package$.prototype = $c_sjs_js_package$.prototype;
$c_sjs_js_package$.prototype.init___ = (function() {
  return this
});
$c_sjs_js_package$.prototype.$undefined__sjs_js_UndefOr = (function() {
  return (void 0)
});
var $d_sjs_js_package$ = new $TypeData().initClass({
  sjs_js_package$: 0
}, false, "scala.scalajs.js.package$", {
  sjs_js_package$: 1,
  O: 1
});
$c_sjs_js_package$.prototype.$classData = $d_sjs_js_package$;
var $n_sjs_js_package$ = (void 0);
function $m_sjs_js_package$() {
  if ((!$n_sjs_js_package$)) {
    $n_sjs_js_package$ = new $c_sjs_js_package$().init___()
  };
  return $n_sjs_js_package$
}
/** @constructor */
function $c_sjsr_Bits$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = false;
  this.arrayBuffer$1 = null;
  this.int32Array$1 = null;
  this.float32Array$1 = null;
  this.float64Array$1 = null;
  this.areTypedArraysBigEndian$1 = false;
  this.highOffset$1 = 0;
  this.lowOffset$1 = 0
}
$c_sjsr_Bits$.prototype = new $h_O();
$c_sjsr_Bits$.prototype.constructor = $c_sjsr_Bits$;
/** @constructor */
function $h_sjsr_Bits$() {
  /*<skip>*/
}
$h_sjsr_Bits$.prototype = $c_sjsr_Bits$.prototype;
$c_sjsr_Bits$.prototype.init___ = (function() {
  $n_sjsr_Bits$ = this;
  var x = ((($g.ArrayBuffer && $g.Int32Array) && $g.Float32Array) && $g.Float64Array);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = $uZ((!(!x)));
  this.arrayBuffer$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.ArrayBuffer(8) : null);
  this.int32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Int32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float64Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float64Array(this.arrayBuffer$1, 0, 1) : null);
  if ((!this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f)) {
    var jsx$1 = true
  } else {
    this.int32Array$1[0] = 16909060;
    var jsx$1 = ($uB(new $g.Int8Array(this.arrayBuffer$1, 0, 8)[0]) === 1)
  };
  this.areTypedArraysBigEndian$1 = jsx$1;
  this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
  this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
  return this
});
$c_sjsr_Bits$.prototype.numberHashCode__D__I = (function(value) {
  var iv = $uI((value | 0));
  if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
    return iv
  } else {
    var t = this.doubleToLongBits__D__J(value);
    var lo = t.lo$2;
    var hi = t.hi$2;
    return (lo ^ hi)
  }
});
$c_sjsr_Bits$.prototype.doubleToLongBitsPolyfill__p1__D__J = (function(value) {
  if ((value !== value)) {
    var _3 = $uD($g.Math.pow(2.0, 51));
    var x1_$_$$und1$1 = false;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = _3
  } else if (((value === Infinity) || (value === (-Infinity)))) {
    var _1 = (value < 0);
    var x1_$_$$und1$1 = _1;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = 0.0
  } else if ((value === 0.0)) {
    var _1$1 = ((1 / value) === (-Infinity));
    var x1_$_$$und1$1 = _1$1;
    var x1_$_$$und2$1 = 0;
    var x1_$_$$und3$1 = 0.0
  } else {
    var s = (value < 0);
    var av = (s ? (-value) : value);
    if ((av >= $uD($g.Math.pow(2.0, (-1022))))) {
      var twoPowFbits = $uD($g.Math.pow(2.0, 52));
      var a = ($uD($g.Math.log(av)) / 0.6931471805599453);
      var x = $uD($g.Math.floor(a));
      var a$1 = $uI((x | 0));
      var e = ((a$1 < 1023) ? a$1 : 1023);
      var b = e;
      var n = ((av / $uD($g.Math.pow(2.0, b))) * twoPowFbits);
      var w = $uD($g.Math.floor(n));
      var f = (n - w);
      var f$1 = ((f < 0.5) ? w : ((f > 0.5) ? (1 + w) : (((w % 2) !== 0) ? (1 + w) : w)));
      if (((f$1 / twoPowFbits) >= 2)) {
        e = ((1 + e) | 0);
        f$1 = 1.0
      };
      if ((e > 1023)) {
        e = 2047;
        f$1 = 0.0
      } else {
        e = ((1023 + e) | 0);
        f$1 = (f$1 - twoPowFbits)
      };
      var _2 = e;
      var _3$1 = f$1;
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = _2;
      var x1_$_$$und3$1 = _3$1
    } else {
      var n$1 = (av / $uD($g.Math.pow(2.0, (-1074))));
      var w$1 = $uD($g.Math.floor(n$1));
      var f$2 = (n$1 - w$1);
      var _3$2 = ((f$2 < 0.5) ? w$1 : ((f$2 > 0.5) ? (1 + w$1) : (((w$1 % 2) !== 0) ? (1 + w$1) : w$1)));
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = 0;
      var x1_$_$$und3$1 = _3$2
    }
  };
  var s$1 = $uZ(x1_$_$$und1$1);
  var e$1 = $uI(x1_$_$$und2$1);
  var f$3 = $uD(x1_$_$$und3$1);
  var x$1 = (f$3 / 4.294967296E9);
  var hif = $uI((x$1 | 0));
  var hi = (((s$1 ? (-2147483648) : 0) | (e$1 << 20)) | hif);
  var lo = $uI((f$3 | 0));
  return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
});
$c_sjsr_Bits$.prototype.doubleToLongBits__D__J = (function(value) {
  if (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f) {
    this.float64Array$1[0] = value;
    var value$1 = $uI(this.int32Array$1[this.highOffset$1]);
    var value$2 = $uI(this.int32Array$1[this.lowOffset$1]);
    return new $c_sjsr_RuntimeLong().init___I__I(value$2, value$1)
  } else {
    return this.doubleToLongBitsPolyfill__p1__D__J(value)
  }
});
var $d_sjsr_Bits$ = new $TypeData().initClass({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", {
  sjsr_Bits$: 1,
  O: 1
});
$c_sjsr_Bits$.prototype.$classData = $d_sjsr_Bits$;
var $n_sjsr_Bits$ = (void 0);
function $m_sjsr_Bits$() {
  if ((!$n_sjsr_Bits$)) {
    $n_sjsr_Bits$ = new $c_sjsr_Bits$().init___()
  };
  return $n_sjsr_Bits$
}
/** @constructor */
function $c_sjsr_RuntimeString$() {
  $c_O.call(this);
  this.CASE$undINSENSITIVE$undORDER$1 = null;
  this.bitmap$0$1 = false
}
$c_sjsr_RuntimeString$.prototype = new $h_O();
$c_sjsr_RuntimeString$.prototype.constructor = $c_sjsr_RuntimeString$;
/** @constructor */
function $h_sjsr_RuntimeString$() {
  /*<skip>*/
}
$h_sjsr_RuntimeString$.prototype = $c_sjsr_RuntimeString$.prototype;
$c_sjsr_RuntimeString$.prototype.init___ = (function() {
  return this
});
$c_sjsr_RuntimeString$.prototype.hashCode__T__I = (function(thiz) {
  var res = 0;
  var mul = 1;
  var i = (((-1) + $uI(thiz.length)) | 0);
  while ((i >= 0)) {
    var jsx$1 = res;
    var index = i;
    res = ((jsx$1 + $imul((65535 & $uI(thiz.charCodeAt(index))), mul)) | 0);
    mul = $imul(31, mul);
    i = (((-1) + i) | 0)
  };
  return res
});
var $d_sjsr_RuntimeString$ = new $TypeData().initClass({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  sjsr_RuntimeString$: 1,
  O: 1
});
$c_sjsr_RuntimeString$.prototype.$classData = $d_sjsr_RuntimeString$;
var $n_sjsr_RuntimeString$ = (void 0);
function $m_sjsr_RuntimeString$() {
  if ((!$n_sjsr_RuntimeString$)) {
    $n_sjsr_RuntimeString$ = new $c_sjsr_RuntimeString$().init___()
  };
  return $n_sjsr_RuntimeString$
}
/** @constructor */
function $c_sjsr_package$() {
  $c_O.call(this)
}
$c_sjsr_package$.prototype = new $h_O();
$c_sjsr_package$.prototype.constructor = $c_sjsr_package$;
/** @constructor */
function $h_sjsr_package$() {
  /*<skip>*/
}
$h_sjsr_package$.prototype = $c_sjsr_package$.prototype;
$c_sjsr_package$.prototype.init___ = (function() {
  return this
});
$c_sjsr_package$.prototype.unwrapJavaScriptException__jl_Throwable__O = (function(th) {
  if ($is_sjs_js_JavaScriptException(th)) {
    var x2 = $as_sjs_js_JavaScriptException(th);
    var e = x2.exception$4;
    return e
  } else {
    return th
  }
});
$c_sjsr_package$.prototype.wrapJavaScriptException__O__jl_Throwable = (function(e) {
  if ($is_jl_Throwable(e)) {
    var x2 = $as_jl_Throwable(e);
    return x2
  } else {
    return new $c_sjs_js_JavaScriptException().init___O(e)
  }
});
var $d_sjsr_package$ = new $TypeData().initClass({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", {
  sjsr_package$: 1,
  O: 1
});
$c_sjsr_package$.prototype.$classData = $d_sjsr_package$;
var $n_sjsr_package$ = (void 0);
function $m_sjsr_package$() {
  if ((!$n_sjsr_package$)) {
    $n_sjsr_package$ = new $c_sjsr_package$().init___()
  };
  return $n_sjsr_package$
}
/** @constructor */
function $c_sr_ScalaRunTime$() {
  $c_O.call(this)
}
$c_sr_ScalaRunTime$.prototype = new $h_O();
$c_sr_ScalaRunTime$.prototype.constructor = $c_sr_ScalaRunTime$;
/** @constructor */
function $h_sr_ScalaRunTime$() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$.prototype = $c_sr_ScalaRunTime$.prototype;
$c_sr_ScalaRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_ScalaRunTime$.prototype.hash__O__I = (function(x) {
  if ((x === null)) {
    return 0
  } else if ($is_jl_Number(x)) {
    var n = $as_jl_Number(x);
    if (((typeof n) === "number")) {
      var x2 = $uD(n);
      return $m_sr_Statics$().doubleHash__D__I(x2)
    } else if ($is_sjsr_RuntimeLong(n)) {
      var t = $uJ(n);
      var lo = t.lo$2;
      var hi = t.hi$2;
      return $m_sr_Statics$().longHash__J__I(new $c_sjsr_RuntimeLong().init___I__I(lo, hi))
    } else {
      return $objectHashCode(n)
    }
  } else {
    return $objectHashCode(x)
  }
});
var $d_sr_ScalaRunTime$ = new $TypeData().initClass({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", {
  sr_ScalaRunTime$: 1,
  O: 1
});
$c_sr_ScalaRunTime$.prototype.$classData = $d_sr_ScalaRunTime$;
var $n_sr_ScalaRunTime$ = (void 0);
function $m_sr_ScalaRunTime$() {
  if ((!$n_sr_ScalaRunTime$)) {
    $n_sr_ScalaRunTime$ = new $c_sr_ScalaRunTime$().init___()
  };
  return $n_sr_ScalaRunTime$
}
/** @constructor */
function $c_sr_Statics$() {
  $c_O.call(this)
}
$c_sr_Statics$.prototype = new $h_O();
$c_sr_Statics$.prototype.constructor = $c_sr_Statics$;
/** @constructor */
function $h_sr_Statics$() {
  /*<skip>*/
}
$h_sr_Statics$.prototype = $c_sr_Statics$.prototype;
$c_sr_Statics$.prototype.init___ = (function() {
  return this
});
$c_sr_Statics$.prototype.doubleHash__D__I = (function(dv) {
  var iv = $doubleToInt(dv);
  if ((iv === dv)) {
    return iv
  } else {
    var this$1 = $m_sjsr_RuntimeLong$();
    var lo = this$1.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(dv);
    var hi = this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
    return (($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi) === dv) ? (lo ^ hi) : $m_sjsr_Bits$().numberHashCode__D__I(dv))
  }
});
$c_sr_Statics$.prototype.longHash__J__I = (function(lv) {
  var lo = lv.lo$2;
  var lo$1 = lv.hi$2;
  return ((lo$1 === (lo >> 31)) ? lo : (lo ^ lo$1))
});
var $d_sr_Statics$ = new $TypeData().initClass({
  sr_Statics$: 0
}, false, "scala.runtime.Statics$", {
  sr_Statics$: 1,
  O: 1
});
$c_sr_Statics$.prototype.$classData = $d_sr_Statics$;
var $n_sr_Statics$ = (void 0);
function $m_sr_Statics$() {
  if ((!$n_sr_Statics$)) {
    $n_sr_Statics$ = new $c_sr_Statics$().init___()
  };
  return $n_sr_Statics$
}
/** @constructor */
function $c_Lcom_highcharts_HighchartsAliases$() {
  $c_O.call(this)
}
$c_Lcom_highcharts_HighchartsAliases$.prototype = new $h_O();
$c_Lcom_highcharts_HighchartsAliases$.prototype.constructor = $c_Lcom_highcharts_HighchartsAliases$;
/** @constructor */
function $h_Lcom_highcharts_HighchartsAliases$() {
  /*<skip>*/
}
$h_Lcom_highcharts_HighchartsAliases$.prototype = $c_Lcom_highcharts_HighchartsAliases$.prototype;
$c_Lcom_highcharts_HighchartsAliases$.prototype.init___ = (function() {
  return this
});
var $d_Lcom_highcharts_HighchartsAliases$ = new $TypeData().initClass({
  Lcom_highcharts_HighchartsAliases$: 0
}, false, "com.highcharts.HighchartsAliases$", {
  Lcom_highcharts_HighchartsAliases$: 1,
  O: 1,
  Lcom_highcharts_AnySeriesDef: 1
});
$c_Lcom_highcharts_HighchartsAliases$.prototype.$classData = $d_Lcom_highcharts_HighchartsAliases$;
var $n_Lcom_highcharts_HighchartsAliases$ = (void 0);
function $m_Lcom_highcharts_HighchartsAliases$() {
  if ((!$n_Lcom_highcharts_HighchartsAliases$)) {
    $n_Lcom_highcharts_HighchartsAliases$ = new $c_Lcom_highcharts_HighchartsAliases$().init___()
  };
  return $n_Lcom_highcharts_HighchartsAliases$
}
/** @constructor */
function $c_Lcom_highcharts_HighchartsUtils$() {
  $c_O.call(this)
}
$c_Lcom_highcharts_HighchartsUtils$.prototype = new $h_O();
$c_Lcom_highcharts_HighchartsUtils$.prototype.constructor = $c_Lcom_highcharts_HighchartsUtils$;
/** @constructor */
function $h_Lcom_highcharts_HighchartsUtils$() {
  /*<skip>*/
}
$h_Lcom_highcharts_HighchartsUtils$.prototype = $c_Lcom_highcharts_HighchartsUtils$.prototype;
$c_Lcom_highcharts_HighchartsUtils$.prototype.init___ = (function() {
  return this
});
var $d_Lcom_highcharts_HighchartsUtils$ = new $TypeData().initClass({
  Lcom_highcharts_HighchartsUtils$: 0
}, false, "com.highcharts.HighchartsUtils$", {
  Lcom_highcharts_HighchartsUtils$: 1,
  O: 1,
  Lcom_highcharts_HighchartsImplicits: 1
});
$c_Lcom_highcharts_HighchartsUtils$.prototype.$classData = $d_Lcom_highcharts_HighchartsUtils$;
var $n_Lcom_highcharts_HighchartsUtils$ = (void 0);
function $m_Lcom_highcharts_HighchartsUtils$() {
  if ((!$n_Lcom_highcharts_HighchartsUtils$)) {
    $n_Lcom_highcharts_HighchartsUtils$ = new $c_Lcom_highcharts_HighchartsUtils$().init___()
  };
  return $n_Lcom_highcharts_HighchartsUtils$
}
/** @constructor */
function $c_LlineChart$() {
  $c_O.call(this)
}
$c_LlineChart$.prototype = new $h_O();
$c_LlineChart$.prototype.constructor = $c_LlineChart$;
/** @constructor */
function $h_LlineChart$() {
  /*<skip>*/
}
$h_LlineChart$.prototype = $c_LlineChart$.prototype;
$c_LlineChart$.prototype.init___ = (function() {
  return this
});
$c_LlineChart$.prototype.main__V = (function() {
  var $this = new $c_Lcom_highcharts_config_HighchartsConfig();
  $this.chart = null;
  $this.title = null;
  $this.yAxis = null;
  $this.series = null;
  var this$43 = $m_Lcom_highcharts_HighchartsUtils$();
  var obj = $m_Lcom_highcharts_config_Chart$().apply__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__Lcom_highcharts_config_Chart((void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), "line", (void 0), (void 0));
  $this.chart = $s_Lcom_highcharts_HighchartsImplicits$class__highchartsCfg__Lcom_highcharts_HighchartsImplicits__sjs_js_Object__sjs_js_UndefOr(this$43, obj);
  var this$53 = $m_Lcom_highcharts_HighchartsUtils$();
  var obj$1 = $m_Lcom_highcharts_config_Title$().apply__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__Lcom_highcharts_config_Title((void 0), (void 0), (void 0), (void 0), "Demo chart", (void 0), (void 0), (void 0), (void 0));
  $this.title = $s_Lcom_highcharts_HighchartsImplicits$class__highchartsCfg__Lcom_highcharts_HighchartsImplicits__sjs_js_Object__sjs_js_UndefOr(this$53, obj$1);
  var this$127 = $m_Lcom_highcharts_HighchartsUtils$();
  var this$63 = $m_Lcom_highcharts_HighchartsUtils$();
  var obj$2 = $m_Lcom_highcharts_config_YAxisTitle$().apply__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__Lcom_highcharts_config_YAxisTitle((void 0), (void 0), (void 0), (void 0), (void 0), (void 0), "Values", (void 0), (void 0));
  var x$61 = $s_Lcom_highcharts_HighchartsImplicits$class__highchartsCfg__Lcom_highcharts_HighchartsImplicits__sjs_js_Object__sjs_js_UndefOr(this$63, obj$2);
  var obj$3 = $m_Lcom_highcharts_config_YAxis$().apply__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__Lcom_highcharts_config_YAxis((void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), x$61, (void 0), (void 0), (void 0));
  $this.yAxis = $s_Lcom_highcharts_HighchartsImplicits$class__highchartsCfg__Lcom_highcharts_HighchartsImplicits__sjs_js_Object__sjs_js_UndefOr(this$127, obj$3);
  var this$189 = $m_Lcom_highcharts_HighchartsAliases$();
  var obj$4 = [1, 2, 3, 7, 2, 9];
  var a = $m_Lcom_highcharts_config_SeriesLine$().apply__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__T__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__sjs_js_UndefOr__Lcom_highcharts_config_SeriesLine((void 0), true, (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), obj$4, (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), "Test Series", (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), (void 0), "line", (void 0), (void 0), (void 0), (void 0), (void 0), (void 0));
  var arr = [a];
  $this.series = $s_Lcom_highcharts_AnySeriesDef$class__anySeriesArrayConvert__Lcom_highcharts_AnySeriesDef__sjs_js_Array__sjs_js_UndefOr(this$189, arr);
  var jsx$1 = $m_Lcom_highcharts_HighchartsUtils$HighchartsJQuery$();
  var jq = (0, $m_Lorg_scalajs_jquery_package$().jQuery$1)("#container");
  jsx$1.highcharts$extension1__Lorg_scalajs_jquery_JQuery__Lcom_highcharts_CleanJsObject__Lorg_scalajs_jquery_JQuery(jq, $m_Lcom_highcharts_CleanJsObject$().apply__sjs_js_Object__sjs_js_Object($this))
});
$c_LlineChart$.prototype.$$js$exported$meth$main__O = (function() {
  this.main__V()
});
$c_LlineChart$.prototype.main = (function() {
  return this.$$js$exported$meth$main__O()
});
var $d_LlineChart$ = new $TypeData().initClass({
  LlineChart$: 0
}, false, "lineChart$", {
  LlineChart$: 1,
  O: 1,
  sjs_js_JSApp: 1
});
$c_LlineChart$.prototype.$classData = $d_LlineChart$;
var $n_LlineChart$ = (void 0);
function $m_LlineChart$() {
  if ((!$n_LlineChart$)) {
    $n_LlineChart$ = new $c_LlineChart$().init___()
  };
  return $n_LlineChart$
}
$e.lineChart = $m_LlineChart$;
/** @constructor */
function $c_jl_Number() {
  $c_O.call(this)
}
$c_jl_Number.prototype = new $h_O();
$c_jl_Number.prototype.constructor = $c_jl_Number;
/** @constructor */
function $h_jl_Number() {
  /*<skip>*/
}
$h_jl_Number.prototype = $c_jl_Number.prototype;
function $is_jl_Number(obj) {
  return (!(!(((obj && obj.$classData) && obj.$classData.ancestors.jl_Number) || ((typeof obj) === "number"))))
}
function $as_jl_Number(obj) {
  return (($is_jl_Number(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Number"))
}
function $isArrayOf_jl_Number(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
}
function $asArrayOf_jl_Number(obj, depth) {
  return (($isArrayOf_jl_Number(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Number;", depth))
}
/** @constructor */
function $c_jl_Throwable() {
  $c_O.call(this);
  this.s$1 = null;
  this.e$1 = null;
  this.stackTrace$1 = null
}
$c_jl_Throwable.prototype = new $h_O();
$c_jl_Throwable.prototype.constructor = $c_jl_Throwable;
/** @constructor */
function $h_jl_Throwable() {
  /*<skip>*/
}
$h_jl_Throwable.prototype = $c_jl_Throwable.prototype;
$c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable = (function() {
  var v = $g.Error.captureStackTrace;
  if ((v === (void 0))) {
    try {
      var e$1 = {}.undef()
    } catch (e) {
      var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        if ($is_sjs_js_JavaScriptException(e$2)) {
          var x5 = $as_sjs_js_JavaScriptException(e$2);
          var e$3 = x5.exception$4;
          var e$1 = e$3
        } else {
          var e$1;
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
        }
      } else {
        var e$1;
        throw e
      }
    };
    this.stackdata = e$1
  } else {
    $g.Error.captureStackTrace(this);
    this.stackdata = this
  };
  return this
});
$c_jl_Throwable.prototype.getMessage__T = (function() {
  return this.s$1
});
$c_jl_Throwable.prototype.toString__T = (function() {
  var className = $objectGetClass(this).getName__T();
  var message = this.getMessage__T();
  return ((message === null) ? className : ((className + ": ") + message))
});
$c_jl_Throwable.prototype.init___T__jl_Throwable = (function(s, e) {
  this.s$1 = s;
  this.e$1 = e;
  this.fillInStackTrace__jl_Throwable();
  return this
});
function $is_jl_Throwable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Throwable)))
}
function $as_jl_Throwable(obj) {
  return (($is_jl_Throwable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Throwable"))
}
function $isArrayOf_jl_Throwable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
}
function $asArrayOf_jl_Throwable(obj, depth) {
  return (($isArrayOf_jl_Throwable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Throwable;", depth))
}
/** @constructor */
function $c_s_util_hashing_MurmurHash3$() {
  $c_s_util_hashing_MurmurHash3.call(this);
  this.arraySeed$2 = 0;
  this.stringSeed$2 = 0;
  this.productSeed$2 = 0;
  this.symmetricSeed$2 = 0;
  this.traversableSeed$2 = 0;
  this.seqSeed$2 = 0;
  this.mapSeed$2 = 0;
  this.setSeed$2 = 0
}
$c_s_util_hashing_MurmurHash3$.prototype = new $h_s_util_hashing_MurmurHash3();
$c_s_util_hashing_MurmurHash3$.prototype.constructor = $c_s_util_hashing_MurmurHash3$;
/** @constructor */
function $h_s_util_hashing_MurmurHash3$() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3$.prototype = $c_s_util_hashing_MurmurHash3$.prototype;
$c_s_util_hashing_MurmurHash3$.prototype.init___ = (function() {
  $n_s_util_hashing_MurmurHash3$ = this;
  this.seqSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Seq");
  this.mapSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Map");
  this.setSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Set");
  return this
});
var $d_s_util_hashing_MurmurHash3$ = new $TypeData().initClass({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
$c_s_util_hashing_MurmurHash3$.prototype.$classData = $d_s_util_hashing_MurmurHash3$;
var $n_s_util_hashing_MurmurHash3$ = (void 0);
function $m_s_util_hashing_MurmurHash3$() {
  if ((!$n_s_util_hashing_MurmurHash3$)) {
    $n_s_util_hashing_MurmurHash3$ = new $c_s_util_hashing_MurmurHash3$().init___()
  };
  return $n_s_util_hashing_MurmurHash3$
}
var $d_sr_BoxedUnit = new $TypeData().initClass({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", {
  sr_BoxedUnit: 1,
  O: 1,
  Ljava_io_Serializable: 1
}, (void 0), (void 0), (function(x) {
  return (x === (void 0))
}));
/** @constructor */
function $c_Lcom_highcharts_config_Chart() {
  $g.Object.call(this);
  $g.Object.defineProperties(this, {
    "alignTicks": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "animation": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "backgroundColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "borderColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "borderRadius": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "borderWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "className": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "defaultSeriesType": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "events": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "height": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "ignoreHiddenSeries": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "inverted": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "margin": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "marginBottom": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "marginLeft": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "marginRight": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "marginTop": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "options3d": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "panKey": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "panning": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "pinchType": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotBackgroundColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotBackgroundImage": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotBorderColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotBorderWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotShadow": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "polar": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "reflow": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "renderTo": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "resetZoomButton": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "selectionMarkerFill": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "shadow": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "showAxes": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "spacing": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "spacingBottom": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "spacingLeft": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "spacingRight": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "spacingTop": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "style": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "type": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "width": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "zoomType": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  this.alignTicks = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.animation = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.backgroundColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.borderColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.borderRadius = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.borderWidth = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.className = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.defaultSeriesType = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.events = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.height = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.ignoreHiddenSeries = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.inverted = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.margin = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.marginBottom = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.marginLeft = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.marginRight = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.marginTop = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.options3d = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.panKey = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.panning = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.pinchType = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.plotBackgroundColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.plotBackgroundImage = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.plotBorderColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.plotBorderWidth = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.plotShadow = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.polar = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.reflow = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.renderTo = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.resetZoomButton = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.selectionMarkerFill = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.shadow = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.showAxes = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.spacing = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.spacingBottom = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.spacingLeft = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.spacingRight = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.spacingTop = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.style = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.type = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.width = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.zoomType = $m_sjs_js_package$().$undefined__sjs_js_UndefOr()
}
/** @constructor */
function $h_Lcom_highcharts_config_Chart() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_Chart.prototype = $g.Object.prototype;
$c_Lcom_highcharts_config_Chart.prototype = new $h_Lcom_highcharts_config_Chart();
$c_Lcom_highcharts_config_Chart.prototype.constructor = $c_Lcom_highcharts_config_Chart;
/** @constructor */
function $c_Lcom_highcharts_config_HighchartsConfig() {
  $g.Object.call(this);
  $g.Object.defineProperties(this, {
    "series": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "chart": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "colors": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "credits": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "data": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "drilldown": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "exporting": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "global": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "labels": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "lang": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "legend": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "loading": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "navigation": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "noData": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "pane": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotOptions": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "subtitle": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "title": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tooltip": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "xAxis": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "yAxis": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  this.series = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.chart = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.colors = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.credits = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.data = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.drilldown = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.exporting = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.global = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.labels = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.lang = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.legend = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.loading = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.navigation = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.noData = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.pane = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.plotOptions = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.subtitle = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.title = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.tooltip = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.xAxis = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.yAxis = $m_sjs_js_package$().$undefined__sjs_js_UndefOr()
}
/** @constructor */
function $h_Lcom_highcharts_config_HighchartsConfig() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_HighchartsConfig.prototype = $g.Object.prototype;
$c_Lcom_highcharts_config_HighchartsConfig.prototype = new $h_Lcom_highcharts_config_HighchartsConfig();
$c_Lcom_highcharts_config_HighchartsConfig.prototype.constructor = $c_Lcom_highcharts_config_HighchartsConfig;
/** @constructor */
function $c_Lcom_highcharts_config_SeriesLine() {
  $g.Object.call(this);
  $g.Object.defineProperties(this, {
    "allowPointSelect": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "animation": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "color": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "connectEnds": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "connectNulls": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "cropThreshold": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "cursor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "dashStyle": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "data": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "dataLabels": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "enableMouseTracking": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "events": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "getExtremesFromAll": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "id": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "index": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "keys": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "legendIndex": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "lineWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "linecap": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "linkedTo": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "marker": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "name": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "negativeColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "point": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "pointInterval": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "pointIntervalUnit": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "pointPlacement": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "pointStart": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "selected": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "shadow": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "showCheckbox": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "showInLegend": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "softThreshold": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "stack": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "stacking": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "states": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "step": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "stickyTracking": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "threshold": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tooltip": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "turboThreshold": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "type": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "visible": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "xAxis": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "yAxis": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "zIndex": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "zoneAxis": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "zones": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  this.allowPointSelect = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.animation = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.color = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.connectEnds = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.connectNulls = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.cropThreshold = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.cursor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.dashStyle = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.data = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.dataLabels = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.enableMouseTracking = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.events = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.getExtremesFromAll = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.id = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.index = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.keys = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.legendIndex = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.lineWidth = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.linecap = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.linkedTo = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.marker = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.name = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.negativeColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.point = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.pointInterval = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.pointIntervalUnit = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.pointPlacement = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.pointStart = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.selected = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.shadow = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.showCheckbox = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.showInLegend = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.softThreshold = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.stack = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.stacking = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.states = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.step = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.stickyTracking = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.threshold = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.tooltip = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.turboThreshold = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.type = "line";
  this.visible = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.xAxis = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.yAxis = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.zIndex = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.zoneAxis = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.zones = $m_sjs_js_package$().$undefined__sjs_js_UndefOr()
}
/** @constructor */
function $h_Lcom_highcharts_config_SeriesLine() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_SeriesLine.prototype = $g.Object.prototype;
$c_Lcom_highcharts_config_SeriesLine.prototype = new $h_Lcom_highcharts_config_SeriesLine();
$c_Lcom_highcharts_config_SeriesLine.prototype.constructor = $c_Lcom_highcharts_config_SeriesLine;
/** @constructor */
function $c_Lcom_highcharts_config_Title() {
  $g.Object.call(this);
  $g.Object.defineProperties(this, {
    "align": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "floating": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "margin": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "style": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "text": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "useHTML": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "verticalAlign": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "x": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "y": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  this.align = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.floating = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.margin = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.style = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.text = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.useHTML = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.verticalAlign = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.x = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.y = $m_sjs_js_package$().$undefined__sjs_js_UndefOr()
}
/** @constructor */
function $h_Lcom_highcharts_config_Title() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_Title.prototype = $g.Object.prototype;
$c_Lcom_highcharts_config_Title.prototype = new $h_Lcom_highcharts_config_Title();
$c_Lcom_highcharts_config_Title.prototype.constructor = $c_Lcom_highcharts_config_Title;
/** @constructor */
function $c_Lcom_highcharts_config_YAxis() {
  $g.Object.call(this);
  $g.Object.defineProperties(this, {
    "allowDecimals": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "alternateGridColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "breaks": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "categories": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "ceiling": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "crosshair": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "dateTimeLabelFormats": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "endOnTick": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "events": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "floor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "gridLineColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "gridLineDashStyle": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "gridLineInterpolation": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "gridLineWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "gridZIndex": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "id": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "labels": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "lineColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "lineWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "linkedTo": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "max": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "maxColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "maxPadding": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "maxZoom": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "min": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minPadding": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minRange": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minTickInterval": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorGridLineColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorGridLineDashStyle": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorGridLineWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorTickColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorTickInterval": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorTickLength": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorTickPosition": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorTickWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "offset": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "opposite": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotBands": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotLines": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "reversed": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "reversedStacks": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "showEmpty": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "showFirstLabel": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "showLastLabel": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "stackLabels": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "startOfWeek": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "startOnTick": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "stops": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickAmount": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickInterval": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickLength": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickPixelInterval": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickPosition": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickPositioner": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickPositions": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickmarkPlacement": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "title": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "type": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "units": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "visible": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  this.allowDecimals = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.alternateGridColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.breaks = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.categories = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.ceiling = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.crosshair = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.dateTimeLabelFormats = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.endOnTick = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.events = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.floor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.gridLineColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.gridLineDashStyle = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.gridLineInterpolation = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.gridLineWidth = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.gridZIndex = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.id = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.labels = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.lineColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.lineWidth = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.linkedTo = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.max = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.maxColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.maxPadding = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.maxZoom = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.min = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.minColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.minPadding = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.minRange = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.minTickInterval = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.minorGridLineColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.minorGridLineDashStyle = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.minorGridLineWidth = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.minorTickColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.minorTickInterval = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.minorTickLength = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.minorTickPosition = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.minorTickWidth = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.offset = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.opposite = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.plotBands = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.plotLines = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.reversed = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.reversedStacks = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.showEmpty = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.showFirstLabel = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.showLastLabel = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.stackLabels = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.startOfWeek = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.startOnTick = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.stops = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.tickAmount = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.tickColor = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.tickInterval = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.tickLength = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.tickPixelInterval = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.tickPosition = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.tickPositioner = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.tickPositions = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.tickWidth = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.tickmarkPlacement = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.title = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.type = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.units = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.visible = $m_sjs_js_package$().$undefined__sjs_js_UndefOr()
}
/** @constructor */
function $h_Lcom_highcharts_config_YAxis() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_YAxis.prototype = $g.Object.prototype;
$c_Lcom_highcharts_config_YAxis.prototype = new $h_Lcom_highcharts_config_YAxis();
$c_Lcom_highcharts_config_YAxis.prototype.constructor = $c_Lcom_highcharts_config_YAxis;
/** @constructor */
function $c_Lcom_highcharts_config_YAxisTitle() {
  $g.Object.call(this);
  $g.Object.defineProperties(this, {
    "align": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "enabled": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "margin": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "offset": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "rotation": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "style": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "text": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "x": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "y": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  this.align = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.enabled = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.margin = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.offset = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.rotation = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.style = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.text = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.x = $m_sjs_js_package$().$undefined__sjs_js_UndefOr();
  this.y = $m_sjs_js_package$().$undefined__sjs_js_UndefOr()
}
/** @constructor */
function $h_Lcom_highcharts_config_YAxisTitle() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_YAxisTitle.prototype = $g.Object.prototype;
$c_Lcom_highcharts_config_YAxisTitle.prototype = new $h_Lcom_highcharts_config_YAxisTitle();
$c_Lcom_highcharts_config_YAxisTitle.prototype.constructor = $c_Lcom_highcharts_config_YAxisTitle;
var $d_jl_Boolean = new $TypeData().initClass({
  jl_Boolean: 0
}, false, "java.lang.Boolean", {
  jl_Boolean: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "boolean")
}));
/** @constructor */
function $c_jl_Double$() {
  $c_O.call(this);
  this.TYPE$1 = null;
  this.POSITIVE$undINFINITY$1 = 0.0;
  this.NEGATIVE$undINFINITY$1 = 0.0;
  this.NaN$1 = 0.0;
  this.MAX$undVALUE$1 = 0.0;
  this.MIN$undVALUE$1 = 0.0;
  this.MAX$undEXPONENT$1 = 0;
  this.MIN$undEXPONENT$1 = 0;
  this.SIZE$1 = 0;
  this.doubleStrPat$1 = null;
  this.bitmap$0$1 = false
}
$c_jl_Double$.prototype = new $h_O();
$c_jl_Double$.prototype.constructor = $c_jl_Double$;
/** @constructor */
function $h_jl_Double$() {
  /*<skip>*/
}
$h_jl_Double$.prototype = $c_jl_Double$.prototype;
$c_jl_Double$.prototype.init___ = (function() {
  return this
});
$c_jl_Double$.prototype.compare__D__D__I = (function(a, b) {
  if ((a !== a)) {
    return ((b !== b) ? 0 : 1)
  } else if ((b !== b)) {
    return (-1)
  } else if ((a === b)) {
    if ((a === 0.0)) {
      var ainf = (1.0 / a);
      return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
    } else {
      return 0
    }
  } else {
    return ((a < b) ? (-1) : 1)
  }
});
var $d_jl_Double$ = new $TypeData().initClass({
  jl_Double$: 0
}, false, "java.lang.Double$", {
  jl_Double$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Double$.prototype.$classData = $d_jl_Double$;
var $n_jl_Double$ = (void 0);
function $m_jl_Double$() {
  if ((!$n_jl_Double$)) {
    $n_jl_Double$ = new $c_jl_Double$().init___()
  };
  return $n_jl_Double$
}
/** @constructor */
function $c_jl_Error() {
  $c_jl_Throwable.call(this)
}
$c_jl_Error.prototype = new $h_jl_Throwable();
$c_jl_Error.prototype.constructor = $c_jl_Error;
/** @constructor */
function $h_jl_Error() {
  /*<skip>*/
}
$h_jl_Error.prototype = $c_jl_Error.prototype;
/** @constructor */
function $c_jl_Exception() {
  $c_jl_Throwable.call(this)
}
$c_jl_Exception.prototype = new $h_jl_Throwable();
$c_jl_Exception.prototype.constructor = $c_jl_Exception;
/** @constructor */
function $h_jl_Exception() {
  /*<skip>*/
}
$h_jl_Exception.prototype = $c_jl_Exception.prototype;
/** @constructor */
function $c_sjsr_RuntimeLong$() {
  $c_O.call(this);
  this.TwoPow32$1 = 0.0;
  this.TwoPow63$1 = 0.0;
  this.UnsignedSafeDoubleHiMask$1 = 0;
  this.AskQuotient$1 = 0;
  this.AskRemainder$1 = 0;
  this.AskToString$1 = 0;
  this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
  this.Zero$1 = null
}
$c_sjsr_RuntimeLong$.prototype = new $h_O();
$c_sjsr_RuntimeLong$.prototype.constructor = $c_sjsr_RuntimeLong$;
/** @constructor */
function $h_sjsr_RuntimeLong$() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong$.prototype = $c_sjsr_RuntimeLong$.prototype;
$c_sjsr_RuntimeLong$.prototype.init___ = (function() {
  $n_sjsr_RuntimeLong$ = this;
  this.Zero$1 = new $c_sjsr_RuntimeLong().init___I__I(0, 0);
  return this
});
$c_sjsr_RuntimeLong$.prototype.Zero__sjsr_RuntimeLong = (function() {
  return this.Zero$1
});
$c_sjsr_RuntimeLong$.prototype.toUnsignedString__p1__I__I__T = (function(lo, hi) {
  if ((((-2097152) & hi) === 0)) {
    var this$5 = ((4.294967296E9 * hi) + $uD((lo >>> 0)));
    return ("" + this$5)
  } else {
    return $as_T(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(lo, hi, 1000000000, 0, 2))
  }
});
$c_sjsr_RuntimeLong$.prototype.divideImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    if ((bhi === (blo >> 31))) {
      if (((alo === (-2147483648)) && (blo === (-1)))) {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return (-2147483648)
      } else {
        var lo = ((alo / blo) | 0);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
        return lo
      }
    } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-1);
      return (-1)
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else {
    var neg = (ahi < 0);
    if (neg) {
      var lo$1 = ((-alo) | 0);
      var hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
      var abs_$_lo$2 = lo$1;
      var abs_$_hi$2 = hi
    } else {
      var abs_$_lo$2 = alo;
      var abs_$_hi$2 = ahi
    };
    var neg$1 = (bhi < 0);
    if (neg$1) {
      var lo$2 = ((-blo) | 0);
      var hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
      var abs$1_$_lo$2 = lo$2;
      var abs$1_$_hi$2 = hi$1
    } else {
      var abs$1_$_lo$2 = blo;
      var abs$1_$_hi$2 = bhi
    };
    var absRLo = this.unsigned$und$div__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
    if ((neg === neg$1)) {
      return absRLo
    } else {
      var hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
      return ((-absRLo) | 0)
    }
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D = (function(lo, hi) {
  if ((hi < 0)) {
    var x = ((lo !== 0) ? (~hi) : ((-hi) | 0));
    var jsx$1 = $uD((x >>> 0));
    var x$1 = ((-lo) | 0);
    return (-((4.294967296E9 * jsx$1) + $uD((x$1 >>> 0))))
  } else {
    return ((4.294967296E9 * hi) + $uD((lo >>> 0)))
  }
});
$c_sjsr_RuntimeLong$.prototype.fromDouble__D__sjsr_RuntimeLong = (function(value) {
  var lo = this.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(value);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I = (function(value) {
  if ((value < (-9.223372036854776E18))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-2147483648);
    return 0
  } else if ((value >= 9.223372036854776E18)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 2147483647;
    return (-1)
  } else {
    var rawLo = $uI((value | 0));
    var x = (value / 4.294967296E9);
    var rawHi = $uI((x | 0));
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (((value < 0) && (rawLo !== 0)) ? (((-1) + rawHi) | 0) : rawHi);
    return rawLo
  }
});
$c_sjsr_RuntimeLong$.prototype.unsigned$und$div__p1__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble / bDouble);
      var x = (rDouble / 4.294967296E9);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = $uI((x | 0));
      return $uI((rDouble | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    var pow = ((31 - $clz32(blo)) | 0);
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((ahi >>> pow) | 0);
    return (((alo >>> pow) | 0) | ((ahi << 1) << ((31 - pow) | 0)))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    var pow$2 = ((31 - $clz32(bhi)) | 0);
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    return ((ahi >>> pow$2) | 0)
  } else {
    return $uI(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 0))
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$toString__I__I__T = (function(lo, hi) {
  return ((hi === (lo >> 31)) ? ("" + lo) : ((hi < 0) ? ("-" + this.toUnsignedString__p1__I__I__T(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))) : this.toUnsignedString__p1__I__I__T(lo, hi)))
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo === blo) ? 0 : ((((-2147483648) ^ alo) < ((-2147483648) ^ blo)) ? (-1) : 1)) : ((ahi < bhi) ? (-1) : 1))
});
$c_sjsr_RuntimeLong$.prototype.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar = (function(alo, ahi, blo, bhi, ask) {
  var shift = ((((bhi !== 0) ? $clz32(bhi) : ((32 + $clz32(blo)) | 0)) - ((ahi !== 0) ? $clz32(ahi) : ((32 + $clz32(alo)) | 0))) | 0);
  var n = shift;
  var lo = (((32 & n) === 0) ? (blo << n) : 0);
  var hi = (((32 & n) === 0) ? (((((blo >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (bhi << n)) : (blo << n));
  var bShiftLo = lo;
  var bShiftHi = hi;
  var remLo = alo;
  var remHi = ahi;
  var quotLo = 0;
  var quotHi = 0;
  while (((shift >= 0) && (((-2097152) & remHi) !== 0))) {
    var alo$1 = remLo;
    var ahi$1 = remHi;
    var blo$1 = bShiftLo;
    var bhi$1 = bShiftHi;
    if (((ahi$1 === bhi$1) ? (((-2147483648) ^ alo$1) >= ((-2147483648) ^ blo$1)) : (((-2147483648) ^ ahi$1) >= ((-2147483648) ^ bhi$1)))) {
      var lo$1 = remLo;
      var hi$1 = remHi;
      var lo$2 = bShiftLo;
      var hi$2 = bShiftHi;
      var lo$3 = ((lo$1 - lo$2) | 0);
      var hi$3 = ((((-2147483648) ^ lo$3) > ((-2147483648) ^ lo$1)) ? (((-1) + ((hi$1 - hi$2) | 0)) | 0) : ((hi$1 - hi$2) | 0));
      remLo = lo$3;
      remHi = hi$3;
      if ((shift < 32)) {
        quotLo = (quotLo | (1 << shift))
      } else {
        quotHi = (quotHi | (1 << shift))
      }
    };
    shift = (((-1) + shift) | 0);
    var lo$4 = bShiftLo;
    var hi$4 = bShiftHi;
    var lo$5 = (((lo$4 >>> 1) | 0) | (hi$4 << 31));
    var hi$5 = ((hi$4 >>> 1) | 0);
    bShiftLo = lo$5;
    bShiftHi = hi$5
  };
  var alo$2 = remLo;
  var ahi$2 = remHi;
  if (((ahi$2 === bhi) ? (((-2147483648) ^ alo$2) >= ((-2147483648) ^ blo)) : (((-2147483648) ^ ahi$2) >= ((-2147483648) ^ bhi)))) {
    var lo$6 = remLo;
    var hi$6 = remHi;
    var remDouble = ((4.294967296E9 * hi$6) + $uD((lo$6 >>> 0)));
    var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
    if ((ask !== 1)) {
      var x = (remDouble / bDouble);
      var lo$7 = $uI((x | 0));
      var x$1 = (x / 4.294967296E9);
      var hi$7 = $uI((x$1 | 0));
      var lo$8 = quotLo;
      var hi$8 = quotHi;
      var lo$9 = ((lo$8 + lo$7) | 0);
      var hi$9 = ((((-2147483648) ^ lo$9) < ((-2147483648) ^ lo$8)) ? ((1 + ((hi$8 + hi$7) | 0)) | 0) : ((hi$8 + hi$7) | 0));
      quotLo = lo$9;
      quotHi = hi$9
    };
    if ((ask !== 0)) {
      var rem_mod_bDouble = (remDouble % bDouble);
      remLo = $uI((rem_mod_bDouble | 0));
      var x$2 = (rem_mod_bDouble / 4.294967296E9);
      remHi = $uI((x$2 | 0))
    }
  };
  if ((ask === 0)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = quotHi;
    var a = quotLo;
    return a
  } else if ((ask === 1)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = remHi;
    var a$1 = remLo;
    return a$1
  } else {
    var lo$10 = quotLo;
    var hi$10 = quotHi;
    var quot = ((4.294967296E9 * hi$10) + $uD((lo$10 >>> 0)));
    var this$25 = remLo;
    var remStr = ("" + this$25);
    var a$2 = ((("" + quot) + $as_T("000000000".substring($uI(remStr.length)))) + remStr);
    return a$2
  }
});
$c_sjsr_RuntimeLong$.prototype.remainderImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    if ((bhi === (blo >> 31))) {
      if ((blo !== (-1))) {
        var lo = ((alo % blo) | 0);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
        return lo
      } else {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return 0
      }
    } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
      return alo
    }
  } else {
    var neg = (ahi < 0);
    if (neg) {
      var lo$1 = ((-alo) | 0);
      var hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
      var abs_$_lo$2 = lo$1;
      var abs_$_hi$2 = hi
    } else {
      var abs_$_lo$2 = alo;
      var abs_$_hi$2 = ahi
    };
    var neg$1 = (bhi < 0);
    if (neg$1) {
      var lo$2 = ((-blo) | 0);
      var hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
      var abs$1_$_lo$2 = lo$2;
      var abs$1_$_hi$2 = hi$1
    } else {
      var abs$1_$_lo$2 = blo;
      var abs$1_$_hi$2 = bhi
    };
    var absRLo = this.unsigned$und$percent__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
    if (neg) {
      var hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
      return ((-absRLo) | 0)
    } else {
      return absRLo
    }
  }
});
$c_sjsr_RuntimeLong$.prototype.unsigned$und$percent__p1__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble % bDouble);
      var x = (rDouble / 4.294967296E9);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = $uI((x | 0));
      return $uI((rDouble | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
      return alo
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    return (alo & (((-1) + blo) | 0))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (ahi & (((-1) + bhi) | 0));
    return alo
  } else {
    return $uI(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 1))
  }
});
var $d_sjsr_RuntimeLong$ = new $TypeData().initClass({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", {
  sjsr_RuntimeLong$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_RuntimeLong$.prototype.$classData = $d_sjsr_RuntimeLong$;
var $n_sjsr_RuntimeLong$ = (void 0);
function $m_sjsr_RuntimeLong$() {
  if ((!$n_sjsr_RuntimeLong$)) {
    $n_sjsr_RuntimeLong$ = new $c_sjsr_RuntimeLong$().init___()
  };
  return $n_sjsr_RuntimeLong$
}
/** @constructor */
function $c_Lcom_highcharts_config_Chart$$anon$1(arg$1, arg$2, arg$3, arg$4, arg$5, arg$6, arg$7, arg$8, arg$9, arg$10, arg$11, arg$12, arg$13, arg$14, arg$15, arg$16, arg$17, arg$18, arg$19, arg$20, arg$21, arg$22, arg$23, arg$24, arg$25, arg$26, arg$27, arg$28, arg$29, arg$30, arg$31, arg$32, arg$33, arg$34, arg$35, arg$36, arg$37, arg$38, arg$39, arg$40, arg$41, arg$42) {
  var alignTicksOuter$1 = arg$1;
  var animationOuter$1 = arg$2;
  var backgroundColorOuter$1 = arg$3;
  var borderColorOuter$1 = arg$4;
  var borderRadiusOuter$1 = arg$5;
  var borderWidthOuter$1 = arg$6;
  var classNameOuter$1 = arg$7;
  var defaultSeriesTypeOuter$1 = arg$8;
  var eventsOuter$1 = arg$9;
  var heightOuter$1 = arg$10;
  var ignoreHiddenSeriesOuter$1 = arg$11;
  var invertedOuter$1 = arg$12;
  var marginOuter$1 = arg$13;
  var marginBottomOuter$1 = arg$14;
  var marginLeftOuter$1 = arg$15;
  var marginRightOuter$1 = arg$16;
  var marginTopOuter$1 = arg$17;
  var options3dOuter$1 = arg$18;
  var panKeyOuter$1 = arg$19;
  var panningOuter$1 = arg$20;
  var pinchTypeOuter$1 = arg$21;
  var plotBackgroundColorOuter$1 = arg$22;
  var plotBackgroundImageOuter$1 = arg$23;
  var plotBorderColorOuter$1 = arg$24;
  var plotBorderWidthOuter$1 = arg$25;
  var plotShadowOuter$1 = arg$26;
  var polarOuter$1 = arg$27;
  var reflowOuter$1 = arg$28;
  var renderToOuter$1 = arg$29;
  var resetZoomButtonOuter$1 = arg$30;
  var selectionMarkerFillOuter$1 = arg$31;
  var shadowOuter$1 = arg$32;
  var showAxesOuter$1 = arg$33;
  var spacingOuter$1 = arg$34;
  var spacingBottomOuter$1 = arg$35;
  var spacingLeftOuter$1 = arg$36;
  var spacingRightOuter$1 = arg$37;
  var spacingTopOuter$1 = arg$38;
  var styleOuter$1 = arg$39;
  var typeOuter$1 = arg$40;
  var widthOuter$1 = arg$41;
  var zoomTypeOuter$1 = arg$42;
  $c_Lcom_highcharts_config_Chart.call(this);
  $g.Object.defineProperties(this, {
    "alignTicks": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "animation": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "backgroundColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "borderColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "borderRadius": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "borderWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "className": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "defaultSeriesType": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "events": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "height": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "ignoreHiddenSeries": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "inverted": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "margin": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "marginBottom": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "marginLeft": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "marginRight": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "marginTop": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "options3d": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "panKey": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "panning": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "pinchType": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotBackgroundColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotBackgroundImage": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotBorderColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotBorderWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotShadow": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "polar": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "reflow": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "renderTo": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "resetZoomButton": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "selectionMarkerFill": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "shadow": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "showAxes": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "spacing": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "spacingBottom": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "spacingLeft": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "spacingRight": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "spacingTop": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "style": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "type": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "width": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "zoomType": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  this.alignTicks = alignTicksOuter$1;
  this.animation = animationOuter$1;
  this.backgroundColor = backgroundColorOuter$1;
  this.borderColor = borderColorOuter$1;
  this.borderRadius = borderRadiusOuter$1;
  this.borderWidth = borderWidthOuter$1;
  this.className = classNameOuter$1;
  this.defaultSeriesType = defaultSeriesTypeOuter$1;
  this.events = eventsOuter$1;
  this.height = heightOuter$1;
  this.ignoreHiddenSeries = ignoreHiddenSeriesOuter$1;
  this.inverted = invertedOuter$1;
  this.margin = marginOuter$1;
  this.marginBottom = marginBottomOuter$1;
  this.marginLeft = marginLeftOuter$1;
  this.marginRight = marginRightOuter$1;
  this.marginTop = marginTopOuter$1;
  this.options3d = options3dOuter$1;
  this.panKey = panKeyOuter$1;
  this.panning = panningOuter$1;
  this.pinchType = pinchTypeOuter$1;
  this.plotBackgroundColor = plotBackgroundColorOuter$1;
  this.plotBackgroundImage = plotBackgroundImageOuter$1;
  this.plotBorderColor = plotBorderColorOuter$1;
  this.plotBorderWidth = plotBorderWidthOuter$1;
  this.plotShadow = plotShadowOuter$1;
  this.polar = polarOuter$1;
  this.reflow = reflowOuter$1;
  this.renderTo = renderToOuter$1;
  this.resetZoomButton = resetZoomButtonOuter$1;
  this.selectionMarkerFill = selectionMarkerFillOuter$1;
  this.shadow = shadowOuter$1;
  this.showAxes = showAxesOuter$1;
  this.spacing = spacingOuter$1;
  this.spacingBottom = spacingBottomOuter$1;
  this.spacingLeft = spacingLeftOuter$1;
  this.spacingRight = spacingRightOuter$1;
  this.spacingTop = spacingTopOuter$1;
  this.style = styleOuter$1;
  this.type = typeOuter$1;
  this.width = widthOuter$1;
  this.zoomType = zoomTypeOuter$1
}
/** @constructor */
function $h_Lcom_highcharts_config_Chart$$anon$1() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_Chart$$anon$1.prototype = $c_Lcom_highcharts_config_Chart.prototype;
$c_Lcom_highcharts_config_Chart$$anon$1.prototype = new $h_Lcom_highcharts_config_Chart$$anon$1();
$c_Lcom_highcharts_config_Chart$$anon$1.prototype.constructor = $c_Lcom_highcharts_config_Chart$$anon$1;
/** @constructor */
function $c_Lcom_highcharts_config_SeriesLine$$anon$1(arg$1, arg$2, arg$3, arg$4, arg$5, arg$6, arg$7, arg$8, arg$9, arg$10, arg$11, arg$12, arg$13, arg$14, arg$15, arg$16, arg$17, arg$18, arg$19, arg$20, arg$21, arg$22, arg$23, arg$24, arg$25, arg$26, arg$27, arg$28, arg$29, arg$30, arg$31, arg$32, arg$33, arg$34, arg$35, arg$36, arg$37, arg$38, arg$39, arg$40, arg$41, arg$42, arg$43, arg$44, arg$45, arg$46, arg$47, arg$48) {
  var allowPointSelectOuter$1 = arg$1;
  var animationOuter$1 = arg$2;
  var colorOuter$1 = arg$3;
  var connectEndsOuter$1 = arg$4;
  var connectNullsOuter$1 = arg$5;
  var cropThresholdOuter$1 = arg$6;
  var cursorOuter$1 = arg$7;
  var dashStyleOuter$1 = arg$8;
  var dataOuter$1 = arg$9;
  var dataLabelsOuter$1 = arg$10;
  var enableMouseTrackingOuter$1 = arg$11;
  var eventsOuter$1 = arg$12;
  var getExtremesFromAllOuter$1 = arg$13;
  var idOuter$1 = arg$14;
  var indexOuter$1 = arg$15;
  var keysOuter$1 = arg$16;
  var legendIndexOuter$1 = arg$17;
  var lineWidthOuter$1 = arg$18;
  var linecapOuter$1 = arg$19;
  var linkedToOuter$1 = arg$20;
  var markerOuter$1 = arg$21;
  var nameOuter$1 = arg$22;
  var negativeColorOuter$1 = arg$23;
  var pointOuter$1 = arg$24;
  var pointIntervalOuter$1 = arg$25;
  var pointIntervalUnitOuter$1 = arg$26;
  var pointPlacementOuter$1 = arg$27;
  var pointStartOuter$1 = arg$28;
  var selectedOuter$1 = arg$29;
  var shadowOuter$1 = arg$30;
  var showCheckboxOuter$1 = arg$31;
  var showInLegendOuter$1 = arg$32;
  var softThresholdOuter$1 = arg$33;
  var stackOuter$1 = arg$34;
  var stackingOuter$1 = arg$35;
  var statesOuter$1 = arg$36;
  var stepOuter$1 = arg$37;
  var stickyTrackingOuter$1 = arg$38;
  var thresholdOuter$1 = arg$39;
  var tooltipOuter$1 = arg$40;
  var turboThresholdOuter$1 = arg$41;
  var typeOuter$1 = $as_T(arg$42);
  var visibleOuter$1 = arg$43;
  var xAxisOuter$1 = arg$44;
  var yAxisOuter$1 = arg$45;
  var zIndexOuter$1 = arg$46;
  var zoneAxisOuter$1 = arg$47;
  var zonesOuter$1 = arg$48;
  $c_Lcom_highcharts_config_SeriesLine.call(this);
  $g.Object.defineProperties(this, {
    "allowPointSelect": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "animation": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "color": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "connectEnds": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "connectNulls": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "cropThreshold": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "cursor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "dashStyle": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "data": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "dataLabels": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "enableMouseTracking": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "events": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "getExtremesFromAll": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "id": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "index": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "keys": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "legendIndex": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "lineWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "linecap": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "linkedTo": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "marker": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "name": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "negativeColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "point": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "pointInterval": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "pointIntervalUnit": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "pointPlacement": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "pointStart": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "selected": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "shadow": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "showCheckbox": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "showInLegend": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "softThreshold": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "stack": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "stacking": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "states": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "step": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "stickyTracking": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "threshold": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tooltip": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "turboThreshold": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "type": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "visible": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "xAxis": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "yAxis": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "zIndex": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "zoneAxis": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "zones": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  this.allowPointSelect = allowPointSelectOuter$1;
  this.animation = animationOuter$1;
  this.color = colorOuter$1;
  this.connectEnds = connectEndsOuter$1;
  this.connectNulls = connectNullsOuter$1;
  this.cropThreshold = cropThresholdOuter$1;
  this.cursor = cursorOuter$1;
  this.dashStyle = dashStyleOuter$1;
  this.data = dataOuter$1;
  this.dataLabels = dataLabelsOuter$1;
  this.enableMouseTracking = enableMouseTrackingOuter$1;
  this.events = eventsOuter$1;
  this.getExtremesFromAll = getExtremesFromAllOuter$1;
  this.id = idOuter$1;
  this.index = indexOuter$1;
  this.keys = keysOuter$1;
  this.legendIndex = legendIndexOuter$1;
  this.lineWidth = lineWidthOuter$1;
  this.linecap = linecapOuter$1;
  this.linkedTo = linkedToOuter$1;
  this.marker = markerOuter$1;
  this.name = nameOuter$1;
  this.negativeColor = negativeColorOuter$1;
  this.point = pointOuter$1;
  this.pointInterval = pointIntervalOuter$1;
  this.pointIntervalUnit = pointIntervalUnitOuter$1;
  this.pointPlacement = pointPlacementOuter$1;
  this.pointStart = pointStartOuter$1;
  this.selected = selectedOuter$1;
  this.shadow = shadowOuter$1;
  this.showCheckbox = showCheckboxOuter$1;
  this.showInLegend = showInLegendOuter$1;
  this.softThreshold = softThresholdOuter$1;
  this.stack = stackOuter$1;
  this.stacking = stackingOuter$1;
  this.states = statesOuter$1;
  this.step = stepOuter$1;
  this.stickyTracking = stickyTrackingOuter$1;
  this.threshold = thresholdOuter$1;
  this.tooltip = tooltipOuter$1;
  this.turboThreshold = turboThresholdOuter$1;
  this.type = typeOuter$1;
  this.visible = visibleOuter$1;
  this.xAxis = xAxisOuter$1;
  this.yAxis = yAxisOuter$1;
  this.zIndex = zIndexOuter$1;
  this.zoneAxis = zoneAxisOuter$1;
  this.zones = zonesOuter$1
}
/** @constructor */
function $h_Lcom_highcharts_config_SeriesLine$$anon$1() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_SeriesLine$$anon$1.prototype = $c_Lcom_highcharts_config_SeriesLine.prototype;
$c_Lcom_highcharts_config_SeriesLine$$anon$1.prototype = new $h_Lcom_highcharts_config_SeriesLine$$anon$1();
$c_Lcom_highcharts_config_SeriesLine$$anon$1.prototype.constructor = $c_Lcom_highcharts_config_SeriesLine$$anon$1;
/** @constructor */
function $c_Lcom_highcharts_config_Title$$anon$1(arg$1, arg$2, arg$3, arg$4, arg$5, arg$6, arg$7, arg$8, arg$9) {
  var alignOuter$1 = arg$1;
  var floatingOuter$1 = arg$2;
  var marginOuter$1 = arg$3;
  var styleOuter$1 = arg$4;
  var textOuter$1 = arg$5;
  var useHTMLOuter$1 = arg$6;
  var verticalAlignOuter$1 = arg$7;
  var xOuter$1 = arg$8;
  var yOuter$1 = arg$9;
  $c_Lcom_highcharts_config_Title.call(this);
  $g.Object.defineProperties(this, {
    "align": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "floating": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "margin": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "style": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "text": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "useHTML": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "verticalAlign": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "x": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "y": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  this.align = alignOuter$1;
  this.floating = floatingOuter$1;
  this.margin = marginOuter$1;
  this.style = styleOuter$1;
  this.text = textOuter$1;
  this.useHTML = useHTMLOuter$1;
  this.verticalAlign = verticalAlignOuter$1;
  this.x = xOuter$1;
  this.y = yOuter$1
}
/** @constructor */
function $h_Lcom_highcharts_config_Title$$anon$1() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_Title$$anon$1.prototype = $c_Lcom_highcharts_config_Title.prototype;
$c_Lcom_highcharts_config_Title$$anon$1.prototype = new $h_Lcom_highcharts_config_Title$$anon$1();
$c_Lcom_highcharts_config_Title$$anon$1.prototype.constructor = $c_Lcom_highcharts_config_Title$$anon$1;
/** @constructor */
function $c_Lcom_highcharts_config_YAxis$$anon$1(arg$1, arg$2, arg$3, arg$4, arg$5, arg$6, arg$7, arg$8, arg$9, arg$10, arg$11, arg$12, arg$13, arg$14, arg$15, arg$16, arg$17, arg$18, arg$19, arg$20, arg$21, arg$22, arg$23, arg$24, arg$25, arg$26, arg$27, arg$28, arg$29, arg$30, arg$31, arg$32, arg$33, arg$34, arg$35, arg$36, arg$37, arg$38, arg$39, arg$40, arg$41, arg$42, arg$43, arg$44, arg$45, arg$46, arg$47, arg$48, arg$49, arg$50, arg$51, arg$52, arg$53, arg$54, arg$55, arg$56, arg$57, arg$58, arg$59, arg$60, arg$61, arg$62, arg$63, arg$64) {
  var allowDecimalsOuter$1 = arg$1;
  var alternateGridColorOuter$1 = arg$2;
  var breaksOuter$1 = arg$3;
  var categoriesOuter$1 = arg$4;
  var ceilingOuter$1 = arg$5;
  var crosshairOuter$1 = arg$6;
  var dateTimeLabelFormatsOuter$1 = arg$7;
  var endOnTickOuter$1 = arg$8;
  var eventsOuter$1 = arg$9;
  var floorOuter$1 = arg$10;
  var gridLineColorOuter$1 = arg$11;
  var gridLineDashStyleOuter$1 = arg$12;
  var gridLineInterpolationOuter$1 = arg$13;
  var gridLineWidthOuter$1 = arg$14;
  var gridZIndexOuter$1 = arg$15;
  var idOuter$1 = arg$16;
  var labelsOuter$1 = arg$17;
  var lineColorOuter$1 = arg$18;
  var lineWidthOuter$1 = arg$19;
  var linkedToOuter$1 = arg$20;
  var maxOuter$1 = arg$21;
  var maxColorOuter$1 = arg$22;
  var maxPaddingOuter$1 = arg$23;
  var maxZoomOuter$1 = arg$24;
  var minOuter$1 = arg$25;
  var minColorOuter$1 = arg$26;
  var minPaddingOuter$1 = arg$27;
  var minRangeOuter$1 = arg$28;
  var minTickIntervalOuter$1 = arg$29;
  var minorGridLineColorOuter$1 = arg$30;
  var minorGridLineDashStyleOuter$1 = arg$31;
  var minorGridLineWidthOuter$1 = arg$32;
  var minorTickColorOuter$1 = arg$33;
  var minorTickIntervalOuter$1 = arg$34;
  var minorTickLengthOuter$1 = arg$35;
  var minorTickPositionOuter$1 = arg$36;
  var minorTickWidthOuter$1 = arg$37;
  var offsetOuter$1 = arg$38;
  var oppositeOuter$1 = arg$39;
  var plotBandsOuter$1 = arg$40;
  var plotLinesOuter$1 = arg$41;
  var reversedOuter$1 = arg$42;
  var reversedStacksOuter$1 = arg$43;
  var showEmptyOuter$1 = arg$44;
  var showFirstLabelOuter$1 = arg$45;
  var showLastLabelOuter$1 = arg$46;
  var stackLabelsOuter$1 = arg$47;
  var startOfWeekOuter$1 = arg$48;
  var startOnTickOuter$1 = arg$49;
  var stopsOuter$1 = arg$50;
  var tickAmountOuter$1 = arg$51;
  var tickColorOuter$1 = arg$52;
  var tickIntervalOuter$1 = arg$53;
  var tickLengthOuter$1 = arg$54;
  var tickPixelIntervalOuter$1 = arg$55;
  var tickPositionOuter$1 = arg$56;
  var tickPositionerOuter$1 = arg$57;
  var tickPositionsOuter$1 = arg$58;
  var tickWidthOuter$1 = arg$59;
  var tickmarkPlacementOuter$1 = arg$60;
  var titleOuter$1 = arg$61;
  var typeOuter$1 = arg$62;
  var unitsOuter$1 = arg$63;
  var visibleOuter$1 = arg$64;
  $c_Lcom_highcharts_config_YAxis.call(this);
  $g.Object.defineProperties(this, {
    "allowDecimals": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "alternateGridColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "breaks": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "categories": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "ceiling": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "crosshair": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "dateTimeLabelFormats": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "endOnTick": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "events": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "floor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "gridLineColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "gridLineDashStyle": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "gridLineInterpolation": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "gridLineWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "gridZIndex": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "id": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "labels": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "lineColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "lineWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "linkedTo": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "max": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "maxColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "maxPadding": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "maxZoom": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "min": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minPadding": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minRange": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minTickInterval": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorGridLineColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorGridLineDashStyle": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorGridLineWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorTickColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorTickInterval": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorTickLength": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorTickPosition": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "minorTickWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "offset": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "opposite": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotBands": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "plotLines": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "reversed": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "reversedStacks": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "showEmpty": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "showFirstLabel": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "showLastLabel": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "stackLabels": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "startOfWeek": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "startOnTick": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "stops": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickAmount": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickColor": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickInterval": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickLength": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickPixelInterval": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickPosition": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickPositioner": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickPositions": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickWidth": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "tickmarkPlacement": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "title": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "type": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "units": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "visible": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  this.allowDecimals = allowDecimalsOuter$1;
  this.alternateGridColor = alternateGridColorOuter$1;
  this.breaks = breaksOuter$1;
  this.categories = categoriesOuter$1;
  this.ceiling = ceilingOuter$1;
  this.crosshair = crosshairOuter$1;
  this.dateTimeLabelFormats = dateTimeLabelFormatsOuter$1;
  this.endOnTick = endOnTickOuter$1;
  this.events = eventsOuter$1;
  this.floor = floorOuter$1;
  this.gridLineColor = gridLineColorOuter$1;
  this.gridLineDashStyle = gridLineDashStyleOuter$1;
  this.gridLineInterpolation = gridLineInterpolationOuter$1;
  this.gridLineWidth = gridLineWidthOuter$1;
  this.gridZIndex = gridZIndexOuter$1;
  this.id = idOuter$1;
  this.labels = labelsOuter$1;
  this.lineColor = lineColorOuter$1;
  this.lineWidth = lineWidthOuter$1;
  this.linkedTo = linkedToOuter$1;
  this.max = maxOuter$1;
  this.maxColor = maxColorOuter$1;
  this.maxPadding = maxPaddingOuter$1;
  this.maxZoom = maxZoomOuter$1;
  this.min = minOuter$1;
  this.minColor = minColorOuter$1;
  this.minPadding = minPaddingOuter$1;
  this.minRange = minRangeOuter$1;
  this.minTickInterval = minTickIntervalOuter$1;
  this.minorGridLineColor = minorGridLineColorOuter$1;
  this.minorGridLineDashStyle = minorGridLineDashStyleOuter$1;
  this.minorGridLineWidth = minorGridLineWidthOuter$1;
  this.minorTickColor = minorTickColorOuter$1;
  this.minorTickInterval = minorTickIntervalOuter$1;
  this.minorTickLength = minorTickLengthOuter$1;
  this.minorTickPosition = minorTickPositionOuter$1;
  this.minorTickWidth = minorTickWidthOuter$1;
  this.offset = offsetOuter$1;
  this.opposite = oppositeOuter$1;
  this.plotBands = plotBandsOuter$1;
  this.plotLines = plotLinesOuter$1;
  this.reversed = reversedOuter$1;
  this.reversedStacks = reversedStacksOuter$1;
  this.showEmpty = showEmptyOuter$1;
  this.showFirstLabel = showFirstLabelOuter$1;
  this.showLastLabel = showLastLabelOuter$1;
  this.stackLabels = stackLabelsOuter$1;
  this.startOfWeek = startOfWeekOuter$1;
  this.startOnTick = startOnTickOuter$1;
  this.stops = stopsOuter$1;
  this.tickAmount = tickAmountOuter$1;
  this.tickColor = tickColorOuter$1;
  this.tickInterval = tickIntervalOuter$1;
  this.tickLength = tickLengthOuter$1;
  this.tickPixelInterval = tickPixelIntervalOuter$1;
  this.tickPosition = tickPositionOuter$1;
  this.tickPositioner = tickPositionerOuter$1;
  this.tickPositions = tickPositionsOuter$1;
  this.tickWidth = tickWidthOuter$1;
  this.tickmarkPlacement = tickmarkPlacementOuter$1;
  this.title = titleOuter$1;
  this.type = typeOuter$1;
  this.units = unitsOuter$1;
  this.visible = visibleOuter$1
}
/** @constructor */
function $h_Lcom_highcharts_config_YAxis$$anon$1() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_YAxis$$anon$1.prototype = $c_Lcom_highcharts_config_YAxis.prototype;
$c_Lcom_highcharts_config_YAxis$$anon$1.prototype = new $h_Lcom_highcharts_config_YAxis$$anon$1();
$c_Lcom_highcharts_config_YAxis$$anon$1.prototype.constructor = $c_Lcom_highcharts_config_YAxis$$anon$1;
/** @constructor */
function $c_Lcom_highcharts_config_YAxisTitle$$anon$1(arg$1, arg$2, arg$3, arg$4, arg$5, arg$6, arg$7, arg$8, arg$9) {
  var alignOuter$1 = arg$1;
  var enabledOuter$1 = arg$2;
  var marginOuter$1 = arg$3;
  var offsetOuter$1 = arg$4;
  var rotationOuter$1 = arg$5;
  var styleOuter$1 = arg$6;
  var textOuter$1 = arg$7;
  var xOuter$1 = arg$8;
  var yOuter$1 = arg$9;
  $c_Lcom_highcharts_config_YAxisTitle.call(this);
  $g.Object.defineProperties(this, {
    "align": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "enabled": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "margin": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "offset": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "rotation": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "style": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "text": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "x": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  $g.Object.defineProperties(this, {
    "y": {
      "configurable": true,
      "enumerable": true,
      "writable": true,
      "value": null
    }
  });
  this.align = alignOuter$1;
  this.enabled = enabledOuter$1;
  this.margin = marginOuter$1;
  this.offset = offsetOuter$1;
  this.rotation = rotationOuter$1;
  this.style = styleOuter$1;
  this.text = textOuter$1;
  this.x = xOuter$1;
  this.y = yOuter$1
}
/** @constructor */
function $h_Lcom_highcharts_config_YAxisTitle$$anon$1() {
  /*<skip>*/
}
$h_Lcom_highcharts_config_YAxisTitle$$anon$1.prototype = $c_Lcom_highcharts_config_YAxisTitle.prototype;
$c_Lcom_highcharts_config_YAxisTitle$$anon$1.prototype = new $h_Lcom_highcharts_config_YAxisTitle$$anon$1();
$c_Lcom_highcharts_config_YAxisTitle$$anon$1.prototype.constructor = $c_Lcom_highcharts_config_YAxisTitle$$anon$1;
function $is_T(obj) {
  return ((typeof obj) === "string")
}
function $as_T(obj) {
  return (($is_T(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.String"))
}
function $isArrayOf_T(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
}
function $asArrayOf_T(obj, depth) {
  return (($isArrayOf_T(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.String;", depth))
}
var $d_T = new $TypeData().initClass({
  T: 0
}, false, "java.lang.String", {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, (void 0), (void 0), $is_T);
var $d_jl_Byte = new $TypeData().initClass({
  jl_Byte: 0
}, false, "java.lang.Byte", {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isByte(x)
}));
/** @constructor */
function $c_jl_CloneNotSupportedException() {
  $c_jl_Exception.call(this)
}
$c_jl_CloneNotSupportedException.prototype = new $h_jl_Exception();
$c_jl_CloneNotSupportedException.prototype.constructor = $c_jl_CloneNotSupportedException;
/** @constructor */
function $h_jl_CloneNotSupportedException() {
  /*<skip>*/
}
$h_jl_CloneNotSupportedException.prototype = $c_jl_CloneNotSupportedException.prototype;
$c_jl_CloneNotSupportedException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_jl_CloneNotSupportedException = new $TypeData().initClass({
  jl_CloneNotSupportedException: 0
}, false, "java.lang.CloneNotSupportedException", {
  jl_CloneNotSupportedException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_CloneNotSupportedException.prototype.$classData = $d_jl_CloneNotSupportedException;
function $isArrayOf_jl_Double(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
}
function $asArrayOf_jl_Double(obj, depth) {
  return (($isArrayOf_jl_Double(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Double;", depth))
}
var $d_jl_Double = new $TypeData().initClass({
  jl_Double: 0
}, false, "java.lang.Double", {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "number")
}));
var $d_jl_Float = new $TypeData().initClass({
  jl_Float: 0
}, false, "java.lang.Float", {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isFloat(x)
}));
var $d_jl_Integer = new $TypeData().initClass({
  jl_Integer: 0
}, false, "java.lang.Integer", {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isInt(x)
}));
function $isArrayOf_jl_Long(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
}
function $asArrayOf_jl_Long(obj, depth) {
  return (($isArrayOf_jl_Long(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Long;", depth))
}
var $d_jl_Long = new $TypeData().initClass({
  jl_Long: 0
}, false, "java.lang.Long", {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $is_sjsr_RuntimeLong(x)
}));
/** @constructor */
function $c_jl_RuntimeException() {
  $c_jl_Exception.call(this)
}
$c_jl_RuntimeException.prototype = new $h_jl_Exception();
$c_jl_RuntimeException.prototype.constructor = $c_jl_RuntimeException;
/** @constructor */
function $h_jl_RuntimeException() {
  /*<skip>*/
}
$h_jl_RuntimeException.prototype = $c_jl_RuntimeException.prototype;
var $d_jl_Short = new $TypeData().initClass({
  jl_Short: 0
}, false, "java.lang.Short", {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isShort(x)
}));
/** @constructor */
function $c_sjsr_RuntimeLong() {
  $c_jl_Number.call(this);
  this.lo$2 = 0;
  this.hi$2 = 0
}
$c_sjsr_RuntimeLong.prototype = new $h_jl_Number();
$c_sjsr_RuntimeLong.prototype.constructor = $c_sjsr_RuntimeLong;
/** @constructor */
function $h_sjsr_RuntimeLong() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong.prototype = $c_sjsr_RuntimeLong.prototype;
$c_sjsr_RuntimeLong.prototype.longValue__J = (function() {
  return $uJ(this)
});
$c_sjsr_RuntimeLong.prototype.$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 | b.lo$2), (this.hi$2 | b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) >= ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
});
$c_sjsr_RuntimeLong.prototype.byteValue__B = (function() {
  return ((this.lo$2 << 24) >> 24)
});
$c_sjsr_RuntimeLong.prototype.equals__O__Z = (function(that) {
  if ($is_sjsr_RuntimeLong(that)) {
    var x2 = $as_sjsr_RuntimeLong(that);
    return ((this.lo$2 === x2.lo$2) && (this.hi$2 === x2.hi$2))
  } else {
    return false
  }
});
$c_sjsr_RuntimeLong.prototype.$$less__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) < ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
});
$c_sjsr_RuntimeLong.prototype.$$times__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var blo = b.lo$2;
  var a0 = (65535 & alo);
  var a1 = ((alo >>> 16) | 0);
  var b0 = (65535 & blo);
  var b1 = ((blo >>> 16) | 0);
  var a0b0 = $imul(a0, b0);
  var a1b0 = $imul(a1, b0);
  var a0b1 = $imul(a0, b1);
  var lo = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
  var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
  var hi = (((((((($imul(alo, b.hi$2) + $imul(this.hi$2, blo)) | 0) + $imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
});
$c_sjsr_RuntimeLong.prototype.init___I__I__I = (function(l, m, h) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, (l | (m << 22)), ((m >> 10) | (h << 12)));
  return this
});
$c_sjsr_RuntimeLong.prototype.$$percent__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.remainderImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong.prototype.toString__T = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toString__I__I__T(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.init___I__I = (function(lo, hi) {
  this.lo$2 = lo;
  this.hi$2 = hi;
  return this
});
$c_sjsr_RuntimeLong.prototype.compareTo__O__I = (function(x$1) {
  var that = $as_sjsr_RuntimeLong(x$1);
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
});
$c_sjsr_RuntimeLong.prototype.$$less$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) <= ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
});
$c_sjsr_RuntimeLong.prototype.$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 & b.lo$2), (this.hi$2 & b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater$greater__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : ((this.hi$2 >>> n) | 0)), (((32 & n) === 0) ? ((this.hi$2 >>> n) | 0) : 0))
});
$c_sjsr_RuntimeLong.prototype.$$greater__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) > ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
});
$c_sjsr_RuntimeLong.prototype.$$less$less__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (this.lo$2 << n) : 0), (((32 & n) === 0) ? (((((this.lo$2 >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (this.hi$2 << n)) : (this.lo$2 << n)))
});
$c_sjsr_RuntimeLong.prototype.init___I = (function(value) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, value, (value >> 31));
  return this
});
$c_sjsr_RuntimeLong.prototype.toInt__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.notEquals__sjsr_RuntimeLong__Z = (function(b) {
  return (!((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2)))
});
$c_sjsr_RuntimeLong.prototype.unary$und$minus__sjsr_RuntimeLong = (function() {
  var lo = this.lo$2;
  var hi = this.hi$2;
  return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  var lo = ((alo + b.lo$2) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) < ((-2147483648) ^ alo)) ? ((1 + ((ahi + bhi) | 0)) | 0) : ((ahi + bhi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.shortValue__S = (function() {
  return ((this.lo$2 << 16) >> 16)
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : (this.hi$2 >> n)), (((32 & n) === 0) ? (this.hi$2 >> n) : (this.hi$2 >> 31)))
});
$c_sjsr_RuntimeLong.prototype.toDouble__D = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.$$div__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.divideImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong.prototype.doubleValue__D = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.hashCode__I = (function() {
  return (this.lo$2 ^ this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.intValue__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.unary$und$tilde__sjsr_RuntimeLong = (function() {
  return new $c_sjsr_RuntimeLong().init___I__I((~this.lo$2), (~this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.compareTo__jl_Long__I = (function(that) {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
});
$c_sjsr_RuntimeLong.prototype.floatValue__F = (function() {
  return $fround($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  var lo = ((alo - b.lo$2) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) > ((-2147483648) ^ alo)) ? (((-1) + ((ahi - bhi) | 0)) | 0) : ((ahi - bhi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 ^ b.lo$2), (this.hi$2 ^ b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.equals__sjsr_RuntimeLong__Z = (function(b) {
  return ((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2))
});
function $is_sjsr_RuntimeLong(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong)))
}
function $as_sjsr_RuntimeLong(obj) {
  return (($is_sjsr_RuntimeLong(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong"))
}
function $isArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
}
function $asArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (($isArrayOf_sjsr_RuntimeLong(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong;", depth))
}
var $d_sjsr_RuntimeLong = new $TypeData().initClass({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_sjsr_RuntimeLong.prototype.$classData = $d_sjsr_RuntimeLong;
/** @constructor */
function $c_jl_ArithmeticException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ArithmeticException.prototype = new $h_jl_RuntimeException();
$c_jl_ArithmeticException.prototype.constructor = $c_jl_ArithmeticException;
/** @constructor */
function $h_jl_ArithmeticException() {
  /*<skip>*/
}
$h_jl_ArithmeticException.prototype = $c_jl_ArithmeticException.prototype;
$c_jl_ArithmeticException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_ArithmeticException = new $TypeData().initClass({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArithmeticException.prototype.$classData = $d_jl_ArithmeticException;
/** @constructor */
function $c_jl_ClassCastException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ClassCastException.prototype = new $h_jl_RuntimeException();
$c_jl_ClassCastException.prototype.constructor = $c_jl_ClassCastException;
/** @constructor */
function $h_jl_ClassCastException() {
  /*<skip>*/
}
$h_jl_ClassCastException.prototype = $c_jl_ClassCastException.prototype;
$c_jl_ClassCastException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_ClassCastException = new $TypeData().initClass({
  jl_ClassCastException: 0
}, false, "java.lang.ClassCastException", {
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ClassCastException.prototype.$classData = $d_jl_ClassCastException;
/** @constructor */
function $c_jl_IndexOutOfBoundsException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IndexOutOfBoundsException.prototype = new $h_jl_RuntimeException();
$c_jl_IndexOutOfBoundsException.prototype.constructor = $c_jl_IndexOutOfBoundsException;
/** @constructor */
function $h_jl_IndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_IndexOutOfBoundsException.prototype = $c_jl_IndexOutOfBoundsException.prototype;
$c_jl_IndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IndexOutOfBoundsException = new $TypeData().initClass({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IndexOutOfBoundsException.prototype.$classData = $d_jl_IndexOutOfBoundsException;
/** @constructor */
function $c_s_MatchError() {
  $c_jl_RuntimeException.call(this);
  this.obj$4 = null;
  this.objString$4 = null;
  this.bitmap$0$4 = false
}
$c_s_MatchError.prototype = new $h_jl_RuntimeException();
$c_s_MatchError.prototype.constructor = $c_s_MatchError;
/** @constructor */
function $h_s_MatchError() {
  /*<skip>*/
}
$h_s_MatchError.prototype = $c_s_MatchError.prototype;
$c_s_MatchError.prototype.objString$lzycompute__p4__T = (function() {
  if ((!this.bitmap$0$4)) {
    this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
    this.bitmap$0$4 = true
  };
  return this.objString$4
});
$c_s_MatchError.prototype.ofClass$1__p4__T = (function() {
  var this$1 = this.obj$4;
  return ("of class " + $objectGetClass(this$1).getName__T())
});
$c_s_MatchError.prototype.liftedTree1$1__p4__T = (function() {
  try {
    return ((($objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return ("an instance " + this.ofClass$1__p4__T())
    } else {
      throw e
    }
  }
});
$c_s_MatchError.prototype.getMessage__T = (function() {
  return this.objString__p4__T()
});
$c_s_MatchError.prototype.objString__p4__T = (function() {
  return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
});
$c_s_MatchError.prototype.init___O = (function(obj) {
  this.obj$4 = obj;
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_s_MatchError = new $TypeData().initClass({
  s_MatchError: 0
}, false, "scala.MatchError", {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_MatchError.prototype.$classData = $d_s_MatchError;
/** @constructor */
function $c_T2() {
  $c_O.call(this);
  this.$$und1$f = null;
  this.$$und2$f = null
}
$c_T2.prototype = new $h_O();
$c_T2.prototype.constructor = $c_T2;
/** @constructor */
function $h_T2() {
  /*<skip>*/
}
$h_T2.prototype = $c_T2.prototype;
$c_T2.prototype.productPrefix__T = (function() {
  return "Tuple2"
});
$c_T2.prototype.productArity__I = (function() {
  return 2
});
$c_T2.prototype.init___O__O = (function(_1, _2) {
  this.$$und1$f = _1;
  this.$$und2$f = _2;
  return this
});
$c_T2.prototype.productElement__I__O = (function(n) {
  return $s_s_Product2$class__productElement__s_Product2__I__O(this, n)
});
$c_T2.prototype.toString__T = (function() {
  return (((("(" + this.$$und1$f) + ",") + this.$$und2$f) + ")")
});
$c_T2.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
function $is_T2(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T2)))
}
function $as_T2(obj) {
  return (($is_T2(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Tuple2"))
}
function $isArrayOf_T2(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T2)))
}
function $asArrayOf_T2(obj, depth) {
  return (($isArrayOf_T2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Tuple2;", depth))
}
var $d_T2 = new $TypeData().initClass({
  T2: 0
}, false, "scala.Tuple2", {
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_T2.prototype.$classData = $d_T2;
/** @constructor */
function $c_sjsr_UndefinedBehaviorError() {
  $c_jl_Error.call(this)
}
$c_sjsr_UndefinedBehaviorError.prototype = new $h_jl_Error();
$c_sjsr_UndefinedBehaviorError.prototype.constructor = $c_sjsr_UndefinedBehaviorError;
/** @constructor */
function $h_sjsr_UndefinedBehaviorError() {
  /*<skip>*/
}
$h_sjsr_UndefinedBehaviorError.prototype = $c_sjsr_UndefinedBehaviorError.prototype;
$c_sjsr_UndefinedBehaviorError.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
$c_sjsr_UndefinedBehaviorError.prototype.init___jl_Throwable = (function(cause) {
  $c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable.call(this, ("An undefined behavior was detected" + ((cause === null) ? "" : (": " + cause.getMessage__T()))), cause);
  return this
});
$c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable = (function(message, cause) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, message, cause);
  return this
});
var $d_sjsr_UndefinedBehaviorError = new $TypeData().initClass({
  sjsr_UndefinedBehaviorError: 0
}, false, "scala.scalajs.runtime.UndefinedBehaviorError", {
  sjsr_UndefinedBehaviorError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_sjsr_UndefinedBehaviorError.prototype.$classData = $d_sjsr_UndefinedBehaviorError;
/** @constructor */
function $c_sjs_js_JavaScriptException() {
  $c_jl_RuntimeException.call(this);
  this.exception$4 = null
}
$c_sjs_js_JavaScriptException.prototype = new $h_jl_RuntimeException();
$c_sjs_js_JavaScriptException.prototype.constructor = $c_sjs_js_JavaScriptException;
/** @constructor */
function $h_sjs_js_JavaScriptException() {
  /*<skip>*/
}
$h_sjs_js_JavaScriptException.prototype = $c_sjs_js_JavaScriptException.prototype;
$c_sjs_js_JavaScriptException.prototype.productPrefix__T = (function() {
  return "JavaScriptException"
});
$c_sjs_js_JavaScriptException.prototype.productArity__I = (function() {
  return 1
});
$c_sjs_js_JavaScriptException.prototype.fillInStackTrace__jl_Throwable = (function() {
  var e = this.exception$4;
  this.stackdata = e;
  return this
});
$c_sjs_js_JavaScriptException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.exception$4;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sjs_js_JavaScriptException.prototype.getMessage__T = (function() {
  return $objectToString(this.exception$4)
});
$c_sjs_js_JavaScriptException.prototype.init___O = (function(exception) {
  this.exception$4 = exception;
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_sjs_js_JavaScriptException.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
function $is_sjs_js_JavaScriptException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_JavaScriptException)))
}
function $as_sjs_js_JavaScriptException(obj) {
  return (($is_sjs_js_JavaScriptException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"))
}
function $isArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
}
function $asArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (($isArrayOf_sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth))
}
var $d_sjs_js_JavaScriptException = new $TypeData().initClass({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
$c_sjs_js_JavaScriptException.prototype.$classData = $d_sjs_js_JavaScriptException;
}).call(this);
//# sourceMappingURL=highcharts_scalajs-fastopt.js.map
