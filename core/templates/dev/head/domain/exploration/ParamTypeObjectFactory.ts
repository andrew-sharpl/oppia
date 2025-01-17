// Copyright 2017 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Factory for creating new frontend instances of ParamType
 * domain objects.
 */

import * as cloneDeep from 'lodash/cloneDeep';

import { Injectable } from '@angular/core';
import { downgradeInjectable } from '@angular/upgrade/static';

export class ParamType {
  _name: string;
  // TODO(#7165): Replace 'any' with the exact type. This has been kept as
  // 'any' because 'valueIsValid' is a function with parameters dependent on the
  // parameters passed to the constructor.
  valueIsValid: (arg0: any) => Boolean;
  // TODO(#7165): Replace 'any' with the exact type. This has been kept as
  // 'any' because 'defaultValue' can be be of any type.
  defaultValue: any;
  /**
   * @private @constructor
   * Defines a specific type that a parameter can take.
   *
   * IMPORTANT: All new types must be created in this file and registered in the
   * {@link ParamType.registry}. See {@link ParamType.registry.UnicodeString}
   * for an example.
   *
   * @param {Function.<?, Boolean>} validateFunction - Returns true when a value
   *    is valid.
   * @param {?} defaultValue - simple value any parameter of this type can take.
   */
  // TODO(#7176): Replace 'any' with the exact type. This has been kept as
  // 'any' because 'typeDefinitionObject' is a dict with underscore_cased keys
  // which give tslint errors against underscore_casing in favor of camelCasing.
  constructor(typeDefinitionObject: any) {
    if (!typeDefinitionObject.validate(typeDefinitionObject.default_value)) {
      throw new Error(
        'The default value is invalid according to validation function');
    }

    /** @member {String} */
    this._name = null;
    /** @member {Function.<?, Boolean>} */
    this.valueIsValid = typeDefinitionObject.validate;
    /** @member {?} */
    this.defaultValue = typeDefinitionObject.default_value;
  }

  /** @returns {?} - A valid default value for this particular type. */
  // TODO(#7165): Replace 'any' with the exact type. This has been kept as
  // 'any' because the return type can be be of any type.
  createDefaultValue(): any {
    return cloneDeep(this.defaultValue);
  }

  /** @returns {String} - The display-name of this type. */
  getName(): string {
    return this._name;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ParamTypeObjectFactory {
  constructor() {
    // To finalize type registration, we encode the name of each type into their
    // definition, then freeze them from modifications.
    Object.keys(this.registry).forEach((paramTypeName: string) => {
      // The bracket notation is needed since 'paramTypeName' is a dynamic
      // property and is not defined on 'registry'.
      /* eslint-disable dot-notation */
      var paramType = this.registry[paramTypeName];
      /* eslint-enable dot-notation */
      paramType._name = paramTypeName;
      Object.freeze(paramType);
    });

    // Finally, we freeze the registry itself.
    Object.freeze(this.registry);
  }
  // Type registration.

  /** @type {Object.<String, ParamType>} */
  registry = {
    UnicodeString: new ParamType({
      // TODO(#7165): Replace 'any' with the exact type. This has been
      // kept as 'any' because the return type can be be of any type.
      validate: (value: any) => {
        return (typeof value === 'string' || value instanceof String);
      },
      default_value: ''
    })
  };

  /** @returns {ParamType} - Implementation-defined default parameter type. */
  getDefaultType(): ParamType {
    return this.registry.UnicodeString;
  }

  /**
   * @param {String} backendName - the name of the type to fetch.
   * @returns {ParamType} - The associated type, if any.
   * @throws {Error} - When the given type name isn't registered.
   */
  getTypeFromBackendName(backendName: string): ParamType | Error {
    if (!this.registry.hasOwnProperty(backendName)) {
      throw new Error(backendName + ' is not a registered parameter type.');
    }
    // The bracket notation is needed since 'backendName' is a dynamic property
    // and is not defined on 'registry'.
    /* eslint-disable dot-notation */
    return this.registry[backendName];
    /* eslint-enable dot-notation */
  }
}

angular.module('oppia').factory(
  'ParamTypeObjectFactory', downgradeInjectable(ParamTypeObjectFactory));
