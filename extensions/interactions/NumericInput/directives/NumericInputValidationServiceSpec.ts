// Copyright 2014 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for numeric input validation service.
 */

// TODO(#7222): Remove the following block of unnnecessary imports once
// NumericInputValidationService.ts is upgraded to Angular 8.
import { baseInteractionValidationService } from
  'interactions/baseInteractionValidationService.ts';
import { OutcomeObjectFactory } from
  'domain/exploration/OutcomeObjectFactory.ts';
import { RuleObjectFactory } from 'domain/exploration/RuleObjectFactory.ts';
import { SubtitledHtmlObjectFactory } from
  'domain/exploration/SubtitledHtmlObjectFactory.ts';
// ^^^ This block is to be removed.

require(
  'interactions/NumericInput/directives/NumericInputValidationService.ts');
describe('NumericInputValidationService', function() {
  var validatorService, WARNING_TYPES;

  var currentState;
  var answerGroups, goodDefaultOutcome;
  var betweenNegativeOneAndOneRule, equalsZeroRule, lessThanOneRule;
  var oof, agof, rof;

  beforeEach(function() {
    angular.mock.module('oppia');
  });
  beforeEach(angular.mock.module('oppia', function($provide) {
    $provide.value(
      'baseInteractionValidationService',
      new baseInteractionValidationService());
    $provide.value(
      'OutcomeObjectFactory', new OutcomeObjectFactory(
        new SubtitledHtmlObjectFactory()));
    $provide.value('RuleObjectFactory', new RuleObjectFactory());
    $provide.value(
      'SubtitledHtmlObjectFactory', new SubtitledHtmlObjectFactory());
  }));

  beforeEach(angular.mock.inject(function($injector) {
    validatorService = $injector.get('NumericInputValidationService');

    WARNING_TYPES = $injector.get('WARNING_TYPES');
    oof = $injector.get('OutcomeObjectFactory');
    agof = $injector.get('AnswerGroupObjectFactory');
    rof = $injector.get('RuleObjectFactory');

    currentState = 'First State';
    goodDefaultOutcome = oof.createFromBackendDict({
      dest: 'Second State',
      feedback: {
        audio_translations: {},
        html: ''
      },
      labelled_as_correct: false,
      param_changes: [],
      refresher_exploration_id: null,
      missing_prerequisite_skill_id: null
    });
    equalsZeroRule = rof.createFromBackendDict({
      rule_type: 'Equals',
      inputs: {
        x: 0
      }
    });
    betweenNegativeOneAndOneRule = rof.createFromBackendDict({
      rule_type: 'IsInclusivelyBetween',
      inputs: {
        a: -1,
        b: 1
      }
    });
    lessThanOneRule = rof.createFromBackendDict({
      rule_type: 'IsLessThan',
      inputs: {
        x: 1
      }
    });
    answerGroups = [agof.createNew(
      [equalsZeroRule, betweenNegativeOneAndOneRule],
      goodDefaultOutcome,
      false,
      null
    )];
  }));

  it('should be able to perform basic validation', function() {
    var warnings = validatorService.getAllWarnings(
      currentState, {}, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([]);
  });

  it('should catch redundant rules', function() {
    answerGroups[0].rules = [betweenNegativeOneAndOneRule, equalsZeroRule];
    var warnings = validatorService.getAllWarnings(
      currentState, {}, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Rule 2 from answer group 1 will never be matched ' +
        'because it is made redundant by rule 1 from answer group 1.'
    }]);
  });

  it('should catch identical rules as redundant', function() {
    answerGroups[0].rules = [equalsZeroRule, equalsZeroRule];
    var warnings = validatorService.getAllWarnings(
      currentState, {}, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Rule 2 from answer group 1 will never be matched ' +
        'because it is made redundant by rule 1 from answer group 1.'
    }]);
  });

  it('should catch redundant rules in separate answer groups', function() {
    answerGroups[1] = angular.copy(answerGroups[0]);
    answerGroups[0].rules = [betweenNegativeOneAndOneRule];
    answerGroups[1].rules = [equalsZeroRule];
    var warnings = validatorService.getAllWarnings(
      currentState, {}, answerGroups, goodDefaultOutcome);
    expect(warnings).toEqual([{
      type: WARNING_TYPES.ERROR,
      message: 'Rule 1 from answer group 2 will never be matched ' +
        'because it is made redundant by rule 1 from answer group 1.'
    }]);
  });

  it('should catch redundant rules caused by greater/less than range',
    function() {
      answerGroups[0].rules = [lessThanOneRule, equalsZeroRule];
      var warnings = validatorService.getAllWarnings(
        currentState, {}, answerGroups, goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: 'Rule 2 from answer group 1 will never be matched ' +
          'because it is made redundant by rule 1 from answer group 1.'
      }]);
    });
});
