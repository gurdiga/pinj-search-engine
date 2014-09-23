(function() {
  'use strict';

  function TestClient(testRunner) {
    this.testRunner = testRunner;

    this.run();
  }

  TestClient.DELAY_BEFORE_STARTING_TESTS = 500;

  MicroEvent.mixin(TestClient);

  TestClient.prototype.run = function() {
    if (!this.testRunner) return;

    if (this.testRunner.reloadedWithoutTheCache) this.announceReadiness();
    else this.reloadWithoutTheCache();
  };

  TestClient.prototype.reloadWithoutTheCache = function() {
    this.testRunner.reloadedWithoutTheCache = true;
    window.location.reload(true);
  };

  TestClient.prototype.announceReadiness = function() {
    setTimeout(function() {
      this.trigger('ready');
    }.bind(this), TestClient.DELAY_BEFORE_STARTING_TESTS);
  };

  window.TestClient = TestClient;

}());
