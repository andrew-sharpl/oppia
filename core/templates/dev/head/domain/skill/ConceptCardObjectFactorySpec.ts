// Copyright 2018 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for ConceptCardObjectFactory.
 */

// TODO(#7222): Remove the following block of unnnecessary imports once
// ConceptCardObjectFactory.ts is upgraded to Angular 8.
import { AudioLanguageObjectFactory } from
  'domain/utilities/AudioLanguageObjectFactory.ts';
import { AutogeneratedAudioLanguageObjectFactory } from
  'domain/utilities/AutogeneratedAudioLanguageObjectFactory.ts';
import { RecordedVoiceoversObjectFactory } from
  'domain/exploration/RecordedVoiceoversObjectFactory.ts';
import { SubtitledHtmlObjectFactory } from
  'domain/exploration/SubtitledHtmlObjectFactory.ts';
import { VoiceoverObjectFactory } from
  'domain/exploration/VoiceoverObjectFactory.ts';
// ^^^ This block is to be removed.

require('App.ts');
require('domain/exploration/SubtitledHtmlObjectFactory.ts');
require('domain/skill/ConceptCardObjectFactory.ts');

describe('Concept card object factory', function() {
  beforeEach(angular.mock.module('oppia'));
  beforeEach(angular.mock.module('oppia', function($provide) {
    $provide.value(
      'AudioLanguageObjectFactory', new AudioLanguageObjectFactory());
    $provide.value(
      'AutogeneratedAudioLanguageObjectFactory',
      new AutogeneratedAudioLanguageObjectFactory());
    $provide.value(
      'RecordedVoiceoversObjectFactory',
      new RecordedVoiceoversObjectFactory(new VoiceoverObjectFactory()));
    $provide.value(
      'SubtitledHtmlObjectFactory', new SubtitledHtmlObjectFactory());
    $provide.value('VoiceoverObjectFactory', new VoiceoverObjectFactory());
  }));

  describe('ConceptCardObjectFactory', function() {
    var ConceptCardObjectFactory;
    var conceptCardDict;
    var SubtitledHtmlObjectFactory;

    beforeEach(angular.mock.inject(function($injector) {
      ConceptCardObjectFactory = $injector.get('ConceptCardObjectFactory');
      SubtitledHtmlObjectFactory = $injector.get('SubtitledHtmlObjectFactory');

      conceptCardDict = {
        explanation: {
          html: 'test explanation',
          content_id: 'explanation',
        },
        worked_examples: [
          {
            html: 'worked example 1',
            content_id: 'worked_example_1'
          },
          {
            html: 'worked example 2',
            content_id: 'worked_example_2'
          }
        ],
        recorded_voiceovers: {
          voiceovers_mapping: {
            explanation: {},
            worked_example_1: {},
            worked_example_2: {}
          }
        }
      };
    }));

    it('should create a new concept card from a backend dictionary',
      function() {
        var conceptCard =
          ConceptCardObjectFactory.createFromBackendDict(conceptCardDict);
        expect(conceptCard.getExplanation()).toEqual(
          SubtitledHtmlObjectFactory.createDefault(
            'test explanation', 'explanation'));
        expect(conceptCard.getWorkedExamples()).toEqual(
          [SubtitledHtmlObjectFactory.createDefault(
            'worked example 1', 'worked_example_1'),
          SubtitledHtmlObjectFactory.createDefault(
            'worked example 2', 'worked_example_2')]);
      });

    it('should convert to a backend dictionary', function() {
      var conceptCard =
        ConceptCardObjectFactory.createFromBackendDict(conceptCardDict);
      expect(conceptCard.toBackendDict()).toEqual(conceptCardDict);
    });

    it('should create an interstitial concept card', function() {
      var conceptCard =
        ConceptCardObjectFactory.createInterstitialConceptCard();
      expect(conceptCard.getExplanation()).toEqual(
        SubtitledHtmlObjectFactory.createDefault(
          'Loading review material', 'explanation'));
      expect(conceptCard.getWorkedExamples()).toEqual([]);
    });
  });
});
