const fs = require('fs');
const { resolve } = require('path');
const yaml = require('yaml');

const filePath = pathName => {
	if (pathName) {
		return resolve(process.cwd(), pathName);
	}

	return resolve(process.cwd());
};

var releaseYaml = {
	name: "Publish Release",

	on: {
		push: {
			// "tags": ['*']
			branches: ['dev', 'master']
		}
	},
	jobs: {
		release: {
			"runs-on": "ubuntu-18.04",
			steps: [
				{
					"uses": "actions/checkout@v2"
				},
				{
					"name": "Get release version",
					"id": "get_release_version",
					"run": "echo ::set-output name=VERSION::${GITHUB_REF#refs/tags/}"
				},
			]
		}
	}
}

var main = async () => {
	const services = ['erxes', 'core', 'gateway', 'crons', 'workers', 'essyncer', 'widgets', 'client-portal'];

	var plugins = ['inbox', 'automations', 'cards', 'clientportal', 'contacts', 'dashboard',
		'emailtemplates', 'engages', 'forms', 'integrations', 'internalnotes',
		'knowledgebase', 'logs', 'notifications',
		'webhooks', 'products', 'segments', 'tags', 'loyalties', 'webbuilder'
	];

	for (const plugin of plugins) {
		services.push(`plugin-${plugin}-api`);
	}

	for (const service of services) {
		releaseYaml.jobs.release.steps.push({
			name: `${service}`,
			if: "github.event_name == 'push' && ( github.ref == 'refs/heads/master' || github.ref == 'refs/heads/dev'  )",
			run: "echo ${{ secrets.DOCKERHUB_TOKEN }} | docker login -u ${{ secrets.DOCKERHUB_USERNAME }} --password-stdin \n"
				+ `docker image pull erxes/${service}:dev \n`
				//      + `docker tag erxes/${service}:dev erxes/${service}:\${GITHUB_REF#refs/tags/} \n`
				//      + `docker push erxes/${service}:\${GITHUB_REF#refs/tags/} \n`
				+ `docker tag erxes/${service}:dev erxes/${service}:master \n`
				+ `docker push erxes/${service}:master \n`
		})
	}

	const yamlString = yaml.stringify(releaseYaml);

	fs.writeFileSync(filePath('.github/workflows/release-test.yml'), yamlString);
}

main();