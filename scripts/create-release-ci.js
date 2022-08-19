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
			"tags": ['*']
			// branches: ['dev', 'master']
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
				{
					"name": "Configure AWS credentials",
					"uses": "aws-actions/configure-aws-credentials@v1",
					"with": {
						"aws-access-key-id": "${{ secrets.AWS_ACCESS_KEY_ID }}",
						"aws-secret-access-key": "${{ secrets.AWS_SECRET_ACCESS_KEY }}",
						"aws-region": "us-west-2"
					}
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
			run: "echo ${{ secrets.DOCKERHUB_TOKEN }} | docker login -u ${{ secrets.DOCKERHUB_USERNAME }} --password-stdin \n"
				+ `docker image pull erxes/${service}:dev \n`
				+ `docker tag erxes/${service}:dev erxes/${service}:\${GITHUB_REF#refs/tags/} \n`
				+ `docker push erxes/${service}:\${GITHUB_REF#refs/tags/} \n`
		})
	}

	for (const plugin of plugins) {
		releaseYaml.jobs.release.steps.push({
			name: `${plugin} ui`,
			run: `aws s3 sync s3://erxes-dev-plugins/uis/plugin-${plugin}-ui s3://erxes-release-plugins/uis/plugin-${plugin}-ui/\${GITHUB_REF#refs/tags/}/`
		})
	}

	const yamlString = yaml.stringify(releaseYaml);

	fs.writeFileSync(filePath('.github/workflows/release.yaml'), yamlString);
}

main();