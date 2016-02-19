/*jshint expr:true */

var jjv = require('..')();
var expect = require('chai').expect;
var draft04Schema = require("./draft-04-schema.json");

describe("basic functinal test", function () {
  var user_schema = {
    type: 'object',
    properties: {
      firstname: {
        type: 'string'
      },
      lastname: {
        type: 'string'
      }
    },
    additionalProperties: false,
    required: ['firstname', 'lastname']
  };
  var user_object = {'firstname': 'first', 'lastname': 'last'};

  before(function () {
    jjv.addSchema('user', user_schema);
  });

  it("required", function () {
    delete user_object.lastname;
    expect(jjv.validate('user', user_object)).to.have.deep.property('validation.lastname.required', true);
    user_object.lastname = 'last';
    expect(jjv.validate('user', user_object)).to.be.null;
  });

  it("additional", function () {
    user_object.nonexistentfield = 'hello there!';
    expect(jjv.validate('user', user_object)).to.have.deep.property('validation.nonexistentfield.additional');
    delete user_object.nonexistentfield;
    expect(jjv.validate('user', user_object)).to.be.null;
  });

  it("optional", function () {
    user_schema.properties.gender = { type: 'string' };
    delete user_object.gender;
    expect(jjv.validate('user', user_object)).to.be.null;
    user_object.gender = 'vampire';
    expect(jjv.validate('user', user_object)).to.be.null;
  });

  describe("type", function () {
    it("string", function () {
      user_schema.properties.gender = { type: 'string' };
      user_object.gender = 42;
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.gender.type', 'string');
      user_object.gender = 'whale';
      expect(jjv.validate('user', user_object)).to.be.null;
    });

    it("number", function () {
      user_schema.properties.gender = { type: 'number' };
      user_object.gender = 'whale';
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.gender.type', 'number');
      user_object.gender = 42.5;
      expect(jjv.validate('user', user_object)).to.be.null;
    });

    it("integer", function () {
      user_schema.properties.gender = { type: 'integer' };
      user_object.gender = 42.5;
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.gender.type', 'integer');
      user_object.gender = 1;
      expect(jjv.validate('user', user_object)).to.be.null;
    });

    it("boolean", function () {
      user_schema.properties.verified = { type: 'boolean' };
      user_object.verified = 33;
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.verified.type', 'boolean');
      user_object.verified = false;
      expect(jjv.validate('user', user_object)).to.be.null;
    });
  });

  describe("format", function () {
    it("alpha", function () {
      user_schema.properties.gender = { type: 'string', format: "alpha" };
      user_object.gender = 'a42';
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.gender.format', true);
      user_object.gender = 'undisclosed';
      expect(jjv.validate('user', user_object)).to.be.null;
    });

    it("numeric", function () {
      user_schema.properties.gender = { type: 'string', format: "numeric" };
      user_object.gender = 'a42';
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.gender.format', true);
      user_object.gender = '42';
      expect(jjv.validate('user', user_object)).to.be.null;
    });

    it("alphanumeric", function () {
      user_schema.properties.gender = { type: 'string', format: "alphanumeric" };
      user_object.gender = 'test%-';
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.gender.format', true);
      user_object.gender = 'a42';
      expect(jjv.validate('user', user_object)).to.be.null;
    });

    it("hexadecimal", function () {
      user_schema.properties.gender = { type: 'string', format: "hexadecimal" };
      user_object.gender = 'x44';
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.gender.format', true);
      user_object.gender = 'deadbeef';
      expect(jjv.validate('user', user_object)).to.be.null;
    });
  });

  describe("generic validators", function () {
    it("pattern", function () {
      user_schema.properties.gender = { type: 'string', pattern: 'ale$' };
      user_object.gender = 'girl';
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.gender.pattern', true);
      user_object.gender = 'male';
      expect(jjv.validate('user', user_object)).to.be.null;
    });

    it("enum", function () {
      user_schema.properties.gender = { type: 'string', 'enum': ["male", "female"] };
      user_object.gender = 'girl';
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.gender.enum', true);
      user_object.gender = 'male';
      expect(jjv.validate('user', user_object)).to.be.null;
    });
  });

  describe("number validators", function () {
    it("multipleOf", function () {
      user_schema.properties.age = { type: 'number', multipleOf: 10 };
      user_object.age = 21;
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.age.multipleOf', true);
      user_object.age = 20;
      expect(jjv.validate('user', user_object)).to.be.null;
    });

    it("minimum", function () {
      user_schema.properties.age = { type: 'number', minimum: 18 };
      user_object.age = 17;
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.age.minimum', true);
      user_object.age = 18;
      expect(jjv.validate('user', user_object)).to.be.null;
    });

    it("maximum", function () {
      user_schema.properties.age = { type: 'number', maximum: 100 };
      user_object.age = 101;
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.age.maximum', true);
      user_object.age = 28;
      expect(jjv.validate('user', user_object)).to.be.null;
    });
  });

  describe('oneof', function () {
    beforeEach(function () {
    user_schema.properties.role = {
      oneOf: [
        {
          type: 'object',
          properties: {
            role_name: {
              type: 'string',
              'enum': ['admin']
            },
            owner_of: {
              type: 'array'
            },
            super_admin: {
                type: 'boolean'
            }
          },
          required: ['role_name', 'owner_of', 'super_admin']
        },
        {
          type: 'object',
          properties: {
            role_name: {
              type: 'string',
              'enum': ['user']
            },
            member_of: {
              type: 'array'
            }
          },
          required: ['role_name', 'member_of']
        }
      ]
    };
    });

    it('invalid', function () {
      user_object.role = {role_name: 'guest'};
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.role');
      user_object.role = {role_name: 'user'};
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.role');
      user_object.role = {role_name: 'admin'};
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.role');
      user_object.role = {role_name: 'admin', member_of: []};
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.role');
      user_object.role = {role_name: 'user', owner_of: []};
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.role');

      user_object.role = {role_name: 'admin', member_of: [], super_admin: false};
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.role.schema.owner_of');
      jjv.defaultOptions.useCoerce = true;
      user_object.role = {role_name: 'admin', member_of: [], super_admin: false};
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.role.schema.owner_of');
      jjv.defaultOptions.useCoerce = false;
	});

    it('valid', function () {
      user_object.role = {role_name: 'admin', owner_of: [], super_admin: true};
      expect(jjv.validate('user', user_object)).to.be.null;
      user_object.role = {role_name: 'user', member_of: []};
      expect(jjv.validate('user', user_object)).to.be.null;
    });
  });


  describe("nested objects", function () {
    user_schema.definitions = {
      location: {
        type: 'object',
        properties: {
          address: {
            type: 'string'
          },
          latlng: {
            type: 'object',
            properties: {
              lat: {
                type: 'number'
              },
              lon: {
                type: 'number'
              }
            },
            required: ['lat', 'lon']
          }
        },
        required: ['address', 'latlng']
      }
    };
    user_schema.properties.loc = { $ref: '#/definitions/location' };

    it("optional", function () {
      expect(jjv.validate('user', user_object)).to.be.null;
    });

    it("required", function () {
      user_object.loc = {};
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.loc.schema').that.deep.equals({address: {required: true}, latlng: {required: true}});
    });

    it("type", function () {
      user_object.loc = {latlng: {lat: 44, lon: 23}};
      expect(jjv.validate('user', user_object)).to.have.deep.property('validation.loc.schema.address.required');
      user_object.loc = {address: 'some street address', latlng: {lat: 44, lon: 23}};
      expect(jjv.validate('user', user_object)).to.be.null;
    });
  });

  it("registers a schema URI without a trailing #", function () {
    jjv.addSchema(draft04Schema);
    expect(jjv.validate(draft04Schema.id, user_schema, { useDefault: false })).to.be.null;
  });

  it("should resolve self-referential absolute URIs with anonymous schemas", function() {
    var selfReferentialSchema = {
      "$schema": "http://json-schema.org/draft-04/schema",
      "id": "lib://manifest.json",
      "title": "Self-referential absolute URI schema",
      "description": "JSON Schema for node/npm package.json",
      "$ref": "lib://manifest.json#/definitions/basic",
      "definitions": {
        "basic": {
          "type": "object",
          "properties": {
            "name": {
              "$ref": "lib://manifest.json#/definitions/name"
            },
            "version": {
              "$ref": "lib://manifest.json#/definitions/semver"
            }
          }
        },
        "name": {
          "type": "string",
          "pattern": "^[A-Za-z](?:[_\\.-]?[A-Za-z0-9]+)*$"
        },
        "semver": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+(?:-[a-z]+(?:[_\\.-]*[a-z0-9]+)*)*$"
        }
      }
    };
    var manifest = {
      "name": "some-module",
      "version": "0.1.0"
    };
    expect(jjv.validate(selfReferentialSchema, manifest)).to.be.null;
  });

  describe("useDefault", function() {
    it("should clone default values", function() {
      var defaults_schema = {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "apples": {
              "type": "array",
              "default": []
            }
          }
        }
      };
      var defaults_object = [
        {},
        {}
      ];
      expect(jjv.validate(defaults_schema, defaults_object, {useDefault: true})).to.be.null;
      expect(defaults_object[0].apples).to.deep.equal([]);
      expect(defaults_object[1].apples).to.deep.equal([]);
      defaults_object[0].apples.push(5);
      expect(defaults_object[0].apples).to.deep.equal([5]);
      expect(defaults_object[1].apples).to.deep.equal([]);
    });

    user_schema.definitions.path = {
      "type": "object",
      "properties": {
        "device": {
          "type": "string"
        },
        "readings": {
          "type": "array",
          "default": [],
          "items": {
            "type": "object",
            "default": {lat: 45, lon: 45},
            "properties": {
              "lat": {
                "type": "number"
              },
              "lon": {
                "type": "number"
              }
            },
            "required": ["lat", "lon"]
          }
        }
      },
      "required": ["device", "readings"]
    };
    user_schema.properties.path = { $ref: "#/definitions/path" };

    jjv.coerceType = {
      array: function(x){
        if (x === null || x === undefined) return [];
        if (!Array.isArray(x)) return [x];
        return x;
      }
    };

    it("should not overwrite with a default", function () {
      user_object.path = {device: "some gps device", readings: {lat: 44, lon: 23}};
      var err = jjv.validate("user", user_object, {useDefault: true});
      expect(err).to.have.deep.property("validation.path.schema.readings.type");

      user_object.path = {device: "some gps device", readings: 0};
      err = jjv.validate("user", user_object, {useDefault: true});
      expect(err).to.have.deep.property("validation.path.schema.readings.type");

      user_object.path = {device: "some gps device", readings: false};
      err = jjv.validate("user", user_object, {useDefault: true});
      expect(err).to.have.deep.property("validation.path.schema.readings.type");
    });

    it("should validate array items", function () {
      user_object.path = {device: "some gps device", readings: [{lat: 44, long: 23}]};
      var err = jjv.validate("user", user_object, {useCoerce: true, useDefault: true});
      expect(err).to.have.deep.property("validation.path.schema.readings.schema[0].schema.lon.required");
    });

    it("should coerce and clone default", function () {
      user_object.path = {device: "some gps device", readings: [{}]};
      var err = jjv.validate("user", user_object, {useCoerce: true, useDefault: true});
      expect(err).to.be.null;
      expect(user_object.path.readings[0].lat).to.equal(45);
      expect(user_object.path.readings[0].lon).to.equal(45);

      user_object.path = {device: "some gps device", readings: [""]};
      err = jjv.validate("user", user_object, {useCoerce: true, useDefault: true});
      expect(err).to.be.null;
      expect(user_object.path.readings[0].lat).to.equal(45);
      expect(user_object.path.readings[0].lon).to.equal(45);

      user_object.path = {device: "some gps device", readings: ""};
      err = jjv.validate("user", user_object, {useCoerce: true, useDefault: true});
      expect(err).to.be.null;
      expect(user_object.path.readings[0].lat).to.equal(45);
      expect(user_object.path.readings[0].lon).to.equal(45);
    });

    it("should not overwrite valid data", function () {
      user_object.path = {device: "some gps device", readings: [{lat: 44, lon: 23}]};
      expect(jjv.validate("user", user_object, {useCoerce: true, useDefault: true})).to.be.null;
    });
  });

  describe("clone function", function() {
    it("should handle objects with a hasOwnProperty property", function() {
      // suppress JSHint warning "'hasOwnProperty' is a really bad name" - we're purposely using really bad names here!
      /* jshint -W001 */
      var defaults_schema = {
        "type": "object",
        "properties": {
          "prop": {
            "type": "object",
            "default": {"hasOwnProperty": "yes"}
          }
        }
      };
      var defaults_object = {};
      expect(jjv.validate(defaults_schema, defaults_object, {useDefault: true})).to.be.null;
      expect(defaults_object.prop).to.deep.equal({"hasOwnProperty": "yes"});
    });
  });
});
